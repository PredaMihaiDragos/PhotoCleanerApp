import React from 'react';
import * as Progress from 'react-native-progress';
import { Text, View } from 'react-native';

const LoadingScreen = (props) => {
  return (
    props.toProcessCnt != 0 && 
    <View style={{backgroundColor: 'rgb(51, 204, 255)', justifyContent: 'center', alignItems: 'center', flex:1}}>
      <View style={{padding:15}}>
        <Text style={{textAlign: 'center', color: 'white', fontFamily: 'verdana', fontSize: 17, fontWeight:'bold'}}>
          Please wait while we take a look at your pictures...
        </Text>
      </View>
      <Progress.Circle
        color={'rgb(0, 51, 153)'} 
        borderWidth={3}
        progress={props.processedCnt / props.toProcessCnt}
        showsText={true} 
        size={120} 
      />
      <View style={{padding:15}}>
        <Text style={{textAlign: 'center', color: 'white', fontFamily: 'verdana', fontSize: 20, fontWeight:'bold'}}>
          Photos processed: {props.processedCnt} / {props.toProcessCnt}
        </Text>
      </View>
    </View>
  )
}

export default LoadingScreen;
