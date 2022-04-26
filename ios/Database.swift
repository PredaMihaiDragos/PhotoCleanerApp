import Foundation
import SQLite

class Database {
  // MARK: - Private Properties
  private var db : OpaquePointer?
  
  // MARK: - Initialization
  init(dbPath: String) {
    self.db = Database.createDB(dbPath: dbPath)
    self.createTable()
  }
  
  // MARK: - Internal Methods
  /// Inserts an image with its corresponding vector into the database.
  func insertImage(imageId: String, vector: [Float]) {
    // Encode the vector with the separator ,
    let encodedVector = vector.map{ String(format: "%.03f", $0) }.joined(separator: ",")
    
    // Create the query and execute the statement.
    let query = "INSERT INTO images (id, vector) VALUES (?, ?);"
    var statement : OpaquePointer? = nil
    
    if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
      // Bind the query values.
      sqlite3_bind_text(statement, 1, (imageId as NSString).utf8String, -1, nil)
      sqlite3_bind_text(statement, 2, (encodedVector as NSString).utf8String, -1, nil)
      
      if sqlite3_step(statement) != SQLITE_DONE {
        print("Data is not inserted in table")
      }
    } else {
      print("Query is not as per requirement")
    }
  }
  
  /// Deletes an image from the database.
  func deleteImage(imageId: String) {
    // Create the query and execute the statement.
    let query = "DELETE FROM images WHERE id='\(imageId)'"
    var statement : OpaquePointer? = nil
    
    if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
      if sqlite3_step(statement) != SQLITE_DONE {
        print("Data was not deleted")
      }
    } else {
      print("Query is not as per requirement")
    }
  }
  
  /// Gets all the images along with their vectors.
  /// - Returns: A dictionary having a key for each image and a value for its vector.
  func getAllImages() -> [String: [Float]] {
    var ret: [String: [Float]] = [:]
    
    // Create the query and execute the statement.
    let query = "SELECT id,vector FROM images WHERE id=id"
    var statement : OpaquePointer? = nil
    
    if sqlite3_prepare_v2(db, query, -1, &statement, nil) == SQLITE_OK {
      while sqlite3_step(statement) == SQLITE_ROW {
        // For each row, get the corresponding parameters.
        let id = String(describing: String(cString: sqlite3_column_text(statement, 0)))
        let encodedVector = String(describing: String(cString: sqlite3_column_text(statement, 1)))
        
        // Decode the vector using the , separator.
        let decodedVector = encodedVector.split(whereSeparator: {$0 == ","})
        ret[id] = decodedVector.map{ Float($0)! }
      }
    }
    
    return ret
  }
  
  // MARK: - Private Methods
  /// Open the database and create if it doesn't exist.
  private static func createDB(dbPath: String) -> OpaquePointer? {
    let filePath = try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false).appendingPathExtension(dbPath)
    
    var db : OpaquePointer? = nil
    if sqlite3_open(filePath.path, &db) != SQLITE_OK {
      print("There is error in creating DB")
      return nil
    } else {
      print("Database has been created with path \(dbPath)")
      return db
    }
  }
  
  /// Creates the table(s) needed for the application.
  private func createTable()  {
    // Create the query and execute the statement.
    let query = "CREATE TABLE IF NOT EXISTS images(id TEXT PRIMARY KEY, vector TEXT);"
    var statement : OpaquePointer? = nil
    
    if sqlite3_prepare_v2(self.db, query, -1, &statement, nil) == SQLITE_OK {
      if sqlite3_step(statement) == SQLITE_DONE {
        print("Table creation fail")
      }
    } else {
      print("Prepration fail")
    }
  }
}
