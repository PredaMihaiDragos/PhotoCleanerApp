import { StyleSheet } from 'react-native'

export default style = StyleSheet.create({
  container: {
    backgroundColor: 'white', 
    height:'100%', 
    width:'100%'
  },

  imageViewer: {
    image: {
      'flex':1, 
      'padding':1
    },
    
    footerContainer: {
      backgroundColor: 'black', 
      height:120, 
      width:400, 
      alignItems: 'center', 
      justifyContent: 'space-evenly', 
      flexDirection:'row'
    }
  },

  imagesContainer: {
    portrait: { 
      flex: 1 / 2, 
      flexDirection: 'row'
    }, 
    
    landscape: { 
      flex: 1 / 3, 
      flexDirection: 'row'
    }
  },

  image: {
    portrait: {
      flex: 1, 
      height: 190, 
      width: 190, 
      margin: 2.5
    },

    landscape: {
      flex: 1, 
      height: 210, 
      width: 210, 
      margin: 2.5
    }
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgb(51, 204, 255)',
    marginBottom:30,
  },

  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },

  footerContainer: {
    height: 90
  },

  footerWithImagesContainer: {
    height: 120
  },

  deletedImagesContainer: {
    flexDirection: 'row', 
    height:30, 
    backgroundColor:'rgb(250, 250, 250)'
  },

  deletedImage: {
    flex: 1, 
    margin:1, 
    height: 20, 
    width: 21
  },

  buttonsContainer: {
    backgroundColor:'rgb(250, 250, 250)', 
    height:90, 
    paddingTop:10, 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    flexDirection:'row'
  }

});
