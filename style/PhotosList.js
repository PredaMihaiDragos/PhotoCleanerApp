import { StyleSheet } from 'react-native'

export default style = StyleSheet.create({
  container: {
    flex:1
  },

  imageContainer: {
    portrait: {
      flex: 1 / 4, 
      flexDirection: 'row'
    },

    landscape: {
      flex: 1 / 7, 
      flexDirection: 'row'
    }
  },

  image: {
    flex: 1, 
    height: 89, 
    width: 89, 
    marginLeft:4, 
    marginBottom:5,
    borderWidth: 3
  },

  footer: {
    borderTopWidth:1,
    borderColor:'#D3D3D3',
    backgroundColor: 'white',
    height:60
  },

  footerWithLoading: {
    borderTopWidth:1,
    borderColor:'#D3D3D3',
    backgroundColor: 'white',
    height:90
  },

  footerPercentAndText: {
    alignItems: 'center'
  },

  footerPercent: {
    paddingTop:2, 
    color: 'black', 
    fontFamily: 'verdana', 
    fontSize: 17, 
    fontWeight:'bold'
  },

  footerText: {
    paddingTop:4, 
    color: 'black', 
    fontFamily: 'verdana', 
    fontSize: 17
  },

  footerTextBold: {
    fontWeight:'bold', 
    color:'#8B0000'
  }
});
