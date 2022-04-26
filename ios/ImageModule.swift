import Foundation
import UIKit
import AVFoundation
import Photos

@objc(ImageModule)
class ImageModule: RCTEventEmitter {
  // MARK: - Private Properties
  private var database: Database
  
  // MARK: - Initialization
  override init() {
    self.database = Database(dbPath: "sqlite3.db")
    super.init()
  }
  
  override func supportedEvents() -> [String]! {
    return ["startProcessing", "processed", "nextImage"]
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Internal Methods
  /// Expects a string consisting of multiple image ids separated by `,` and deletes them.
  @objc
  func deleteImages(_ imageIds: String) {
    // Split the string to create an array.
    let imageIdsArray: [String] = imageIds.split(whereSeparator: {$0 == ","}).map { String($0) }
    
    // Fetch all photos.
    var assetsToDelete: [PHAsset] = []
    let fetchOptions = PHFetchOptions()
    let allPhotos = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    allPhotos.enumerateObjects{(object: AnyObject!, count: Int, stop: UnsafeMutablePointer<ObjCBool>) in
      
      // For each photo check if its id is in our array and if it is, add it to assetsToDelete.
      if object is PHAsset {
        let asset = object as! PHAsset
        
        if (imageIdsArray.contains(asset.localIdentifier)) {
          assetsToDelete.append(asset)
        }
      }
    }
    
    // Delete the photos from the assetsToDelete array.
    PHPhotoLibrary.shared().performChanges({
      PHAssetChangeRequest.deleteAssets(assetsToDelete as NSFastEnumeration)
    })
  }
  
  /// Fetches all the photos in the device, transforms them in vectors and orders them by similarity.
  ///
  /// Multiple native events are called from within this function:
  /// - startProcessing: when the processing of the images starts
  ///   - toProcessCnt event parameter: how many photos are in the device
  /// - processed: when a photo was transformed in a vector
  ///   - processedCnt: how many photos have been processed until now
  /// - nextImage: when a new photo can be added to the order
  ///   - identifier: the id of the image to be added
  ///   - similarity: similarity with the previous image (between 0 and 1)
  ///   - photoSize: size in bytes of the image
  ///
  /// When the function ends, successCallback is called with no parameter.
  @objc
  func processImages(_ successCallback:@escaping RCTResponseSenderBlock) {
    // Declare utils
    let modelDataHandler = ModelDataHandler(modelFileInfo: MobileNet.modelInfo)
    let imageManager = PHCachingImageManager()
    
    // Declare the arrays for the processed images
    var imageVectors = [[Float]]()
    var imageIds = [String]()
    var imageSizes = [Int64]()
    var visited = [Bool]()
    
    
    PHPhotoLibrary.requestAuthorization { (status) in
      switch status {
        case .authorized:
          // Get already processed images from database.
          let allImageVectors = self.database.getAllImages()
          
          // Fetch all the images from the device and send an event to mark the processing start.
          let fetchOptions = PHFetchOptions()
          let allPhotos = PHAsset.fetchAssets(with: .image, options: fetchOptions)
          self.sendEvent(withName: "startProcessing" , body: ["toProcessCnt": allPhotos.count])
          allPhotos.enumerateObjects{(object: AnyObject!, count: Int, stop: UnsafeMutablePointer<ObjCBool>) in
            
            if object is PHAsset {
              let asset = object as! PHAsset
              
              // Request the image.
              let imageSize = CGSize(width: asset.pixelWidth,
                                     height: asset.pixelHeight)
              
              let options = PHImageRequestOptions()
              options.deliveryMode = .fastFormat
              options.isSynchronous = true
              imageManager.requestImage(for: asset,
                                        targetSize: imageSize, contentMode: .aspectFill,
                                        options: options,
                                        resultHandler: { image, info in
                
                // If the image is not in the database, run the model to process it.
                var result = allImageVectors[asset.localIdentifier]
                if result == nil {
                  let photo = ImageModule.buffer(from: image!)
                  result = modelDataHandler!.runModel(onFrame: photo!)
                  self.database.insertImage(imageId: asset.localIdentifier, vector: result!)
                }
                
                // Update vectors.
                imageVectors.append(result!)
                imageIds.append(asset.localIdentifier)
                imageSizes.append(ImageModule.getAssetSize(asset: asset))
                visited.append(false)
                
                // A new image was processed, so call an event.
                self.sendEvent(withName: "processed" , body: ["processedCnt": imageVectors.count])
                
                // If all images were transformed into vectors, we can begin the sorting.
                if imageVectors.count == allPhotos.count {
                  // First image in the sorting can be any image, we will use image with id 0.
                  self.sendEvent(withName: "nextImage" , body: ["identifier": imageIds[0],  "similarity": -1, "photoSize": imageSizes[0]])
                  visited[0] = true
                  
                  // At each iteration we will find a new image for our order.
                  var lastImage = 0
                  let n = imageVectors.count;
                  for _ in 1...n-1 {
                    var best_similarity: Float = -1000000
                    var nextImage: Int = -1
                    
                    // Iterate through all non-visited images at each step to find next image.
                    // Next image is the one that is the most similar with the last one.
                    for j in 0...n-1 {
                      if visited[j] == false {
                        let similarity: Float = ImageModule.cosine_similarity(A: imageVectors[lastImage], B: imageVectors[j])
                        if similarity > best_similarity {
                          best_similarity = similarity
                          nextImage = j
                        }
                      }
                    }
                    
                    // We have a new image, call an event.
                    self.sendEvent(withName: "nextImage" , body: ["identifier": imageIds[nextImage], "similarity": best_similarity, "photoSize": imageSizes[nextImage]])
                    visited[nextImage] = true
                    lastImage = nextImage
                  }
                  
                  // If there are any images in the database that are no longer in the library,
                  // delete them from the database.
                  for (imageId, _) in allImageVectors {
                    if (!imageIds.contains(imageId)) {
                      self.database.deleteImage(imageId: imageId)
                    }
                  }
                  
                  // Our function is done, we should stop now.
                  successCallback([])
                  stop.pointee = true
                }
              })
            }
          }
        case .denied, .restricted:
          print("Not allowed")
        case .notDetermined:
          print("Not determined yet")
        default:
          assert(false)
      }
    }
  }
  
  // MARK: - Private Methods
  /// Transforms an UIImage int oa CVPixelBuffer.
  private static func buffer(from image: UIImage) -> CVPixelBuffer? {
    let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue, kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue] as CFDictionary
    var pixelBuffer : CVPixelBuffer?
    let status = CVPixelBufferCreate(kCFAllocatorDefault, Int(image.size.width), Int(image.size.height), kCVPixelFormatType_32ARGB, attrs, &pixelBuffer)
    guard (status == kCVReturnSuccess) else {
      return nil
    }
    
    CVPixelBufferLockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
    let pixelData = CVPixelBufferGetBaseAddress(pixelBuffer!)
    
    let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
    let context = CGContext(data: pixelData, width: Int(image.size.width), height: Int(image.size.height), bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer!), space: rgbColorSpace, bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
    
    context?.translateBy(x: 0, y: image.size.height)
    context?.scaleBy(x: 1.0, y: -1.0)
    
    UIGraphicsPushContext(context!)
    image.draw(in: CGRect(x: 0, y: 0, width: image.size.width, height: image.size.height))
    UIGraphicsPopContext()
    CVPixelBufferUnlockBaseAddress(pixelBuffer!, CVPixelBufferLockFlags(rawValue: 0))
    
    return pixelBuffer
  }
  
  /// Computes cosine similarity between two vectors.
  private static func cosine_similarity(A: [Float], B: [Float]) -> Float {
    // TODO: Optimize to use the GPU
    var dot: Float = 0;
    var denom_a: Float = 0;
    var denom_b: Float = 0;
    let n = A.count;
    assert(A.count == B.count)
    for i in 0...n-1 {
      dot += A[i] * B[i];
      denom_a += A[i] * A[i];
      denom_b += B[i] * B[i];
    }
    return dot / (sqrt(denom_a) * sqrt(denom_b))
  }
  
  /// Finds the size of an asset.
  private static func getAssetSize(asset: PHAsset) -> Int64 {
    let resources = PHAssetResource.assetResources(for: asset)
    
    guard let resource = resources.first,
          let unsignedInt64 = resource.value(forKey: "fileSize") as? CLong else {
      return Int64.max
    }
    
    return Int64(bitPattern: UInt64(unsignedInt64))
  }
}
