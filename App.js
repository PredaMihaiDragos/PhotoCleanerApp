/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native'
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, TouchableOpacity, Image, StyleSheet, View, FlatList } from 'react-native';
import LoadingScreen from './components/LoadingScreen';
import GroupSelect from './components/GroupSelect';
import PhotosList from './components/PhotosList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen'

const App = () => {
  const pathPrefix = 'ph://'
  const MIN_SIMILARITY_IN_GROUP = 0.5;
  let lastGroupId = -1;
  let minSizeInGroup = Infinity
  const ImageModule = require('react-native').NativeModules.ImageModule;
  const Stack = createNativeStackNavigator();

  const [images, setImages] = useState([]);
  const [processingStartTime, setProcessingStartTime] = useState(0)
  const [processedCnt, setProcessedCnt] = useState(0)
  const [toProcessCnt, setToProcessCnt] = useState(0)
  const [groupSelected, setGroupSelected] = useState(-1)
  const [savableSpace, setSavableSpace] = useState(0)

  const startProcessingEvent = (data) => {
    setToProcessCnt(data['toProcessCnt']);
    setProcessingStartTime(Date.now());
  }

  const processedEvent = (data) => {
    setProcessedCnt(data['processedCnt'])
  }

  const nextImageEvent = (data) => {
    const imagePath = pathPrefix + data['identifier'];
    const similarity = data['similarity'];
    const photoSize = data['photoSize'];

    if (similarity < MIN_SIMILARITY_IN_GROUP) {
      lastGroupId++;
      minSizeInGroup = photoSize;
    } else {
      if (photoSize < minSizeInGroup) {
        setSavableSpace(currentSavableSpace => currentSavableSpace + minSizeInGroup)
        minSizeInGroup = photoSize
      } else {
        setSavableSpace(currentSavableSpace => currentSavableSpace + photoSize)
      }
    }

    setImages((currentState) => [...currentState, {
      'url': imagePath,
      'groupId': lastGroupId,
      'similarity': similarity
    }]);
  }

  useEffect(() => {
    SplashScreen.hide()

    const myModuleEvt = new NativeEventEmitter(NativeModules.ImageModule);
    myModuleEvt.addListener('startProcessing', (data) => startProcessingEvent(data));
    myModuleEvt.addListener('processed', (data) => processedEvent(data));
    myModuleEvt.addListener('nextImage', (data) => nextImageEvent(data));

    // startProcessingEvent({'toProcessCnt': 200})
  
    ImageModule.processImages(function() {
      
    });
  }, []);

  const deleteImages = (imagesToDelete) => {
    setImages(currentImages => currentImages.filter(image => !imagesToDelete.includes(image)))
    ImageModule.deleteImages(imagesToDelete.map(image => image.url.slice(pathPrefix.length))
                                                .join(','))
  }

  return (
      processedCnt > 0 && processedCnt === toProcessCnt ?
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="All photos">
              {props => 
                <PhotosList 
                  {...props} 
                  images={images} 
                  totalImagesNr={toProcessCnt}
                  setGroupSelected={setGroupSelected}
                  savableSpace={savableSpace}
                />
              }
            </Stack.Screen>
            <Stack.Screen name="Select photos">
              {props => 
                <GroupSelect 
                  {...props} 
                  images={images} 
                  groupId={groupSelected}
                  deleteImages={deleteImages}
                />
              }
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer> :
        <LoadingScreen 
          toProcessCnt={toProcessCnt} 
          processedCnt={processedCnt} 
          processingStartTime={processingStartTime}
        />
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

});
