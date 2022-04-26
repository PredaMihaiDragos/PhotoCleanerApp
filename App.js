import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen'

import LoadingScreen from './components/LoadingScreen';
import GroupSelect from './components/GroupSelect';
import PhotosList from './components/PhotosList';
  
const App = () => {
  // Constants
  const pathPrefix = 'ph://'
  const MIN_SIMILARITY_IN_GROUP = 0.5;
  const ImageModule = require('react-native').NativeModules.ImageModule;
  const Stack = createNativeStackNavigator();

  // Variables
  let lastGroupId = -1;
  let minSizeInGroup = Infinity
  
  // States
  const [images, setImages] = useState([]);
  const [processingStartTime, setProcessingStartTime] = useState(0)
  const [processedCnt, setProcessedCnt] = useState(0)
  const [toProcessCnt, setToProcessCnt] = useState(0)
  const [groupSelected, setGroupSelected] = useState(-1)
  const [savableSpace, setSavableSpace] = useState(0)

  // Util functions
  const deleteImages = (imagesToDelete) => {
    // Update the state.
    setImages(currentImages => currentImages.filter(image => !imagesToDelete.includes(image)))

    // Also delete images from device using the module.
    ImageModule.deleteImages(imagesToDelete.map(image => image.url.slice(pathPrefix.length))
                                           .join(','))
  }

  // Event handlers

  // Gets called when the processing of the images start.
  const startProcessingEvent = (data) => {
    setToProcessCnt(data['toProcessCnt']);
    setProcessingStartTime(Date.now());
  }

  // Gets called when a new image finished processing.
  const processedEvent = (data) => {
    setProcessedCnt(data['processedCnt'])
  }

  // Gets called when a new image is ready to be rendered in order.
  const nextImageEvent = (data) => {
    const imagePath = pathPrefix + data['identifier'];
    const similarity = data['similarity'];
    const photoSize = data['photoSize'];

    // Check if we should create a new group.
    if (similarity < MIN_SIMILARITY_IN_GROUP) {
      lastGroupId++;
      minSizeInGroup = photoSize;
    } else {
      // Update the savableSpace and minSizeInGroup if needed.
      if (photoSize < minSizeInGroup) {
        setSavableSpace(currentSavableSpace => currentSavableSpace + minSizeInGroup)
        minSizeInGroup = photoSize
      } else {
        setSavableSpace(currentSavableSpace => currentSavableSpace + photoSize)
      }
    }

    // Add the new image to the state.
    setImages((currentState) => [...currentState, {
      'url': imagePath,
      'groupId': lastGroupId,
      'similarity': similarity
    }]);
  }

  // Init
  useEffect(() => {
    SplashScreen.hide()

    // Call the event handlers when an event is triggered.
    const imageEventModule = new NativeEventEmitter(NativeModules.ImageModule);
    imageEventModule.addListener('startProcessing', (data) => startProcessingEvent(data));
    imageEventModule.addListener('processed', (data) => processedEvent(data));
    imageEventModule.addListener('nextImage', (data) => nextImageEvent(data));
  
    // Start processing images.
    ImageModule.processImages(() => {});
  }, []);

  return (
      processedCnt > 0 && processedCnt === toProcessCnt ?
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='All photos'>
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
            <Stack.Screen name='Select photos'>
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
