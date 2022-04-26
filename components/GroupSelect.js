import React from 'react';
import { useState } from 'react';
import { Button, StyleSheet, Pressable, TouchableOpacity, Image, Text, SafeAreaView, View, FlatList, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const GroupSelect = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);
  const [layout, setLayout] = useState('portrait')

  const getAllGroupImages = () => {
    // Can be optimised with a binary search if a lot of images
    return props.images?.filter(image => image.groupId == props.groupId) ?? [];
  }

  const getCurrentGroupImages = () => {
    return getAllGroupImages().filter(image => !deletedImages.includes(image.url));
  }

  const getToDeleteImages = () => {
    return getAllGroupImages().filter(image => deletedImages.includes(image.url));
  }

  const getSelectedImageIndex = () => {
    const groupImages = getCurrentGroupImages()

    for (let i = 0; i < groupImages.length; ++i) {
      if (groupImages[i].url === selectedImage.url) {
        return i;
      }
    }

    return 0;
  }

  const deleteSelected = () => {
    props.deleteImages(getToDeleteImages())
  }

  const deleteAllGroup = () => {
    props.deleteImages(getAllGroupImages())
    props.navigation.goBack()
  }

  return (
    <View 
      style={{backgroundColor:'white', height:'100%', width:'100%'}} 
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout(height > width ? 'portrait' : 'landscape')
      }}
    >
       {selectedImage !== null ? 
       <Modal visible={true} transparent={true}>
       <ImageViewer 
        imageUrls={getCurrentGroupImages().map(image => {
          return {
            url: image.url,
            props: {'flex':1,"padding":1}
          }
        })}
        onSwipeDown={() => setSelectedImage(null)}
        index={getSelectedImageIndex()}
        renderFooter={(index) => (
          <View style={{backgroundColor: 'black', height:120, width:400, alignItems: 'center', justifyContent: 'space-evenly', flexDirection:"row"}}>
            <Pressable style={styles.button} onPress={() =>
              setDeletedImages([...deletedImages, getCurrentGroupImages()[index].url])} 
            >
              <Text style={styles.text}>Select to delete</Text>
            </Pressable>
          </View>
        )}
        enableImageZoom={true}
        enableSwipeDown={true}
       />
       </Modal>:
        <>
          <FlatList
            data={getCurrentGroupImages()}
            renderItem={({ item }) => (
              <SafeAreaView style={{ flex: 1 / (layout === 'portrait' ? 2 : 3), flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => setDeletedImages([...deletedImages, item.url])}
                  onLongPress={() => setSelectedImage(item)}
                >
                  <Image
                    style={{ flex: 1, height: (layout === 'portrait' ? 190 : 210), width: (layout === 'portrait' ? 190 : 210), margin: 2.5 }} 
                    source={{ uri: item.url }} 
                  />
                </TouchableOpacity>
              </SafeAreaView>
            )}
            key={'flatlist-' + layout}
            numColumns={layout === 'portrait' ? 2 : 3}
            keyExtractor={(item, index) => index}
          /> 
          <View style={{height:getToDeleteImages().length > 0 ? 120 : 90}}>
            {getToDeleteImages().length > 0 && 
              <View style={{flexDirection:"row", height:30, backgroundColor:'rgb(250, 250, 250)'}}>
                <FlatList
                  data={getToDeleteImages()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => setDeletedImages(deletedImages.filter(imageUrl => imageUrl !== item.url))}
                    >
                      <Image
                        style={{ flex: 1, margin:1, height: 20, width: 21 }} 
                        source={{ uri: item.url }} 
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                  horizontal={true}
                />
              </View>
            } 
            <View style={{backgroundColor:'rgb(250, 250, 250)', height:90, paddingTop:10, alignItems: 'center', justifyContent: 'space-evenly', flexDirection:"row"}}>
              <Pressable style={styles.button} onPress={() => deleteAllGroup()}>
                <Text style={styles.text}>Delete all group</Text>
              </Pressable>
              {getAllGroupImages().length != getToDeleteImages().length && 
               getToDeleteImages().length != 0 && 
                <Pressable style={styles.button} onPress={() => deleteSelected()}>
                  <Text style={styles.text}>Delete selected</Text>
                </Pressable>
              }
            </View>
          </View>
        </>
       }
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgb(51, 204, 255)',
    marginBottom:30,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

export default GroupSelect;
