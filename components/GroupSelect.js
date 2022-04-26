import React, {useState} from 'react';
import {Pressable, TouchableOpacity, Image, Text,
  SafeAreaView, View, FlatList, Modal} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

import style from '../style/GroupSelect';

const GroupSelect = ({images, deleteImages, navigation, groupId}) => {
  // States
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);
  const [layout, setLayout] = useState('portrait');

  // Util functions
  const getAllGroupImages = () => {
    // Can be optimised with a binary search if a lot of images
    return images.filter((image) =>
      image.groupId == groupId) ?? [];
  };

  const getCurrentGroupImages = () => {
    return getAllGroupImages().filter((image) =>
      !deletedImages.includes(image.url));
  };

  const getToDeleteImages = () => {
    return getAllGroupImages().filter((image) =>
      deletedImages.includes(image.url));
  };

  const getSelectedImageIndex = () => {
    const groupImages = getCurrentGroupImages();

    for (let i = 0; i < groupImages.length; ++i) {
      if (groupImages[i].url === selectedImage.url) {
        return i;
      }
    }

    return 0;
  };

  const deleteSelected = () => {
    deleteImages(getToDeleteImages());
  };

  const deleteAllGroup = () => {
    deleteImages(getAllGroupImages());
    navigation.goBack();
  };

  return (
    <View
      style={style.container}
      onLayout={(event) => {
        const {width, height} = event.nativeEvent.layout;
        setLayout(height > width ? 'portrait' : 'landscape');
      }}
    >
      {selectedImage !== null ?
        <Modal visible={true} transparent={true}>
          <ImageViewer
            imageUrls={getCurrentGroupImages().map((image) => {
              return {
                url: image.url,
                props: style.imageViewer.image,
              };
            })}
            onSwipeDown={() => setSelectedImage(null)}
            index={getSelectedImageIndex()}
            renderFooter={(index) => (
              <View style={style.imageViewer.footerContainer}>
                <Pressable style={style.button} onPress={() =>
                  setDeletedImages([...deletedImages,
                    getCurrentGroupImages()[index].url])}
                >
                  <Text style={style.buttonText}>Select to delete</Text>
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
            renderItem={({item}) => (
              <SafeAreaView style={style.imagesContainer[layout]}>
                <TouchableOpacity
                  onPress={() => setDeletedImages([...deletedImages, item.url])}
                  onLongPress={() => setSelectedImage(item)}
                >
                  <Image
                    style={style.image[layout]}
                    source={{uri: item.url}}
                  />
                </TouchableOpacity>
              </SafeAreaView>
            )}
            key={'flatlist-' + layout}
            numColumns={layout === 'portrait' ? 2 : 3}
            keyExtractor={(item, index) => index}
          />
          <View style=
            {getToDeleteImages().length > 0 ?
              style.footerWithImagesContainer :
              style.footerContainer}>
            {getToDeleteImages().length > 0 &&
              <View style={style.deletedImagesContainer}>
                <FlatList
                  data={getToDeleteImages()}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        setDeletedImages(deletedImages.filter((imageUrl) =>
                          imageUrl !== item.url))}
                    >
                      <Image
                        style={style.deletedImage}
                        source={{uri: item.url}}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(_, index) => index}
                  horizontal={true}
                />
              </View>
            }
            <View style={style.buttonsContainer}>
              <Pressable style={style.button} onPress={() => deleteAllGroup()}>
                <Text style={style.buttonText}>Delete all group</Text>
              </Pressable>
              {getAllGroupImages().length != getToDeleteImages().length &&
               getToDeleteImages().length != 0 &&
                <Pressable style={style.button} onPress={() =>
                  deleteSelected()}>
                  <Text style={style.buttonText}>Delete selected</Text>
                </Pressable>
              }
            </View>
          </View>
        </>
      }
    </View>
  );
};

export default GroupSelect;
