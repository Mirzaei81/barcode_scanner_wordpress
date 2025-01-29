import { useEffect, useState } from "react"
import { Product } from "./typs"
import { View } from "@/components/Themed"
import { Platform, StyleSheet,Text } from "react-native"
import { Image } from "expo-image"
import WebView from "react-native-webview"
import {readAsStringAsync} from "expo-file-system"
import { productFileUri } from "./"
const rtlWrapper = `<div style="direction: rtl">`

export default function App(){
    const [product,setProduct] = useState<Product>()
    const [attr,setAttr] = useState("")
    useEffect(()=>{
        (async()=>{
            const prodString  =await readAsStringAsync(productFileUri)
            const retrive_prod:Product= JSON.parse(prodString)
            setProduct(retrive_prod)
            const protectAttr =  retrive_prod?.attributes.filter(attr=>attr.name.includes("مراقبت"))
            console.log(product?.short_description)
            console.log(product?.short_description)
            if(protectAttr[0].options && protectAttr[0].options.length>0){
                setAttr(protectAttr[0].options[0])
            }
        })()
    },[])
    return(
        <View style={styles.container}>
            <Image style={styles.img}  source={product?.images[0].src}></Image>
            <Text style={styles.text}>قیمت: {product?.price}</Text>    
            <Text style={styles.text}>برند: {product?.brands[0].name}</Text>    
            <Text style={styles.text}>وزن: {product?.weight}</Text>    
            {attr==""?<></>:<Text style={styles.text}>{attr}</Text>}
            <Text style={styles.text}>شناسه محصول: {product?.sku}</Text>    
            {
                Platform.OS === 'web'
                ? <div dangerouslySetInnerHTML={{ __html: product?.short_description! }} />
                : 
                    <View style={{flex:1,backgroundColor:"black",direction:"rtl"}}>
                        <WebView
                            style={styles.desc}
                            originWhitelist={["*"]}
                            textZoom={350}
                            source={{ html: rtlWrapper+product?.short_description!+"</div>" }}
                        />
                    </View>
            }
        </View>
    )

}
const styles = StyleSheet.create({
    img: {
        width: 100,
        height: 100,
    },
  container: {
    direction:"rtl",
    flex: 1,
    justifyContent: 'center',
    alignItems:"center",
    backgroundColor:"white",
    padding:2
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 24,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    width: 100
  },
  text: {
    marginHorizontal:20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  desc:{
      fontWeight: 'bold',
      fontSize:200,
      height: 100,
      width : 300
  }
});