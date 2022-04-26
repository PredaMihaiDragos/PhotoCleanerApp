import React from 'react';
import * as Progress from 'react-native-progress';
import { Text, View } from 'react-native';
import style from '../style/LoadingScreen'

const LoadingScreen = ({processedCnt, toProcessCnt}) => {
  return (
    toProcessCnt != 0 && 
    <View style={style.container}>
      <View style={style.upContainer}>
        <Text style={style.upText}>
          Please wait while we take a look at your pictures...
        </Text>
      </View>
      <Progress.Circle
        color={style.circleColor} 
        borderWidth={3}
        progress={processedCnt / toProcessCnt}
        showsText={true} 
        size={120} 
      />
      <View style={style.downContainer}>
        <Text style={style.downText}>
          Photos processed: {processedCnt} / {toProcessCnt}
        </Text>
      </View>
    </View>
  )
}

export default LoadingScreen;
