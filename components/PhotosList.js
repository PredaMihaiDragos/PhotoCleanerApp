import React from 'react';
import { useState } from 'react';
import * as Progress from 'react-native-progress';
import { TouchableOpacity, Image, SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native';

const PhotosList = (props) => {
  const [layout, setLayout] = useState('portrait')

  const getLoadingValue = () => {
    const totalImagesNr = props.totalImagesNr
    const processedImagesNr = props.images.length
    const comparisionsToDo = totalImagesNr * (totalImagesNr - 1) / 2

    // totalImagesNr-1 + totalImagesNr-2 + ... + totalImagesNr-processedImagesNr
    const comparisionsDone = (totalImagesNr-1 + totalImagesNr-processedImagesNr) * processedImagesNr / 2

    return comparisionsDone / comparisionsToDo
  }

  const getLoadingPercent = () => {
    const value = getLoadingValue()

    return Math.floor(value * 100).toString() + '%'
  }

  const getSimilarPhotosNr = () => {
    if (props.images.length === 0) {
      return 0
    }
    const groupsNr = props.images[props.images.length-1].groupId + 1;

    return props.images.length - groupsNr;
  }

  const getSavableSpaceFormatted = () => {
    const space = props.savableSpace;
    if (space > 1000000000) {
      return (space / 1000000000).toFixed(2) + ' GB'
    }
    
    return (space / 1000000).toFixed(0) + ' MB'
  }

  const groupColors = ['#FD367E', '#FFF56D', '#99FFCD', '#3E4377', 
                       '#FF9900', '#125B50', '#E0D8B0', '#4700D8']
  return (
    <View style={{flex: 1}} onLayout={(event) => {
      const { width, height } = event.nativeEvent.layout;
      setLayout(height > width ? 'portrait' : 'landscape')
    }}>
      <FlatList
        data={props.images ?? []}
        renderItem={({ item }) => (
          <SafeAreaView style={{ flex: 1 / (layout === 'portrait' ? 4 : 7), flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => {
              props.setGroupSelected(item.groupId)
              props.navigation.navigate("Select photos")
            }}>
              <Image 
              style={{ flex: 1, height: 89, width: 89, marginLeft:4, marginBottom:5, borderColor: groupColors[item.groupId % groupColors.length], borderWidth: 3 }} 
              source={{ uri: item.url }} 
              />
            </TouchableOpacity>
          </SafeAreaView>
        )}
        key={'flatlist-' + layout}
        numColumns={layout === 'portrait' ? 4 : 7}
        keyExtractor={(item, index) => index}
      /> 
      <View style={{borderTopWidth:1, borderColor:'#D3D3D3', backgroundColor: 'white', height:getLoadingValue() == 1 ? 60 : 90}}>
        {getLoadingValue() != 1 &&
          <Progress.Bar 
          progress={getLoadingValue()}
          showsText={true} 
          width={null} 
          borderRadius={0}
        />
        }
        <View style={{alignItems: 'center'}}>
          { getLoadingValue() != 1 && 
            <Text style={{paddingTop:2, color: 'black', fontFamily: 'verdana', fontSize: 17, fontWeight:'bold'}}>
              {getLoadingPercent()}
            </Text>
          }
          <Text style={{paddingTop:4, color: 'black', fontFamily: 'verdana', fontSize: 17}}>
            Similar photos: 
              <Text style={{fontWeight:'bold', color:'#8B0000'}}>
                &nbsp;{getSimilarPhotosNr()} ({getSavableSpaceFormatted()})
              </Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

export default PhotosList;
