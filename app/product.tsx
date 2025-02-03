import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet,Dimensions} from 'react-native';
import { Image } from 'expo-image';
import { Product } from './types';
// @ts-ignore
import DomParser from   "react-native-html-parser"
import { readAsStringAsync } from 'expo-file-system';
import { productPath } from './';
import WebView from 'react-native-webview';
import { Button } from 'react-native-paper';
import {openBrowserAsync} from "expo-web-browser"
import { useAssets } from 'expo-asset';

const colorMain = "#016bb7"
const colorSecondary = "#f7d33d"
const {height:ScreenHeight,width:ScreenWidth} = Dimensions.get("window");
const descriptionWrapper = `<div style='border-radius: 5rem;padding-right:40;background-color:${colorSecondary};direction: rtl;font-size:54;font-weight:900;'>`

export default function App() {
  const [product, setProduct] = useState<Product>()
  const [attr, setAttr] = useState("")
  const [assets,error]= useAssets([require("../assets/images/Title.png")])

  useEffect(()=>{
    (async()=>{
        const product:Product = JSON.parse(await readAsStringAsync(productPath))
        const protectAttr = product.attributes.filter(attr => attr.name.includes("مراقبت"))
        setProduct(product)

        if (protectAttr && protectAttr[0].options && protectAttr[0].options.length > 0) {
            setAttr(protectAttr[0].options[0])
        }
    })()
  },[])

  async function goProductDetail(){
    await openBrowserAsync(product?.permalink!);
  }

  return (
      <View style={styles.container}>
          <View style={styles.header}>
              <Button contentStyle={{height:70}} mode="outlined" onTouchStart={goProductDetail} labelStyle={styles.buttonLabel} style={styles.button}>لینک محصول</Button>
              {assets?<Image source={assets[0]} style={{ width: 195, height: 80 }} />:<></>}
          </View>

          <View style={styles.row}>
              <Text style={styles.text}>شناسه محصول </Text><Text style={styles.detail}>{product?.sku}</Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>نام </Text><Text style={styles.detail}>{product?.name}</Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>قیمت </Text><Text style={styles.detail}> {product?.price}</Text>
          </View>

          <View style={styles.row}>
              <Text style={styles.text}>برند </Text><Text style={styles.detail}> {product?.brands[0].name}</Text>
          </View>


          <View style={styles.row}>
              {attr == "" ? <></> : <Text style={styles.text}>{attr}</Text>}
          </View>
          <View style={[styles.row,{height:170}]}>
              <View style={{backgroundColor:colorMain}}>
                  <Text style={styles.text}>معرفی</Text>
              </View>
              <WebView
                  style={styles.container}
                  originWhitelist={['*']}
                  source={{ html: descriptionWrapper + product?.short_description + "</div>" }}
              />
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>ابعاد </Text><Text style={styles.detail}>  {product?.dimensions.height}x{product?.dimensions.width}x{product?.dimensions.length} </Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>وزن </Text><Text style={styles.detail}>  {product?.weight}  kg</Text>
          </View>
          <View style={{display:"flex",alignItems:"center",backgroundColor:colorMain}}>
              <Button labelStyle={styles.buttonLabel}  style={[styles.button, ]} onTouchStart={() => router.push("/")}>اسکن</Button>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
    main: {
        marginVertical: 5,
    },
    row: {
        flexDirection: "row-reverse",
        margin: 7,
        backgroundColor: colorMain
    },
    header: {
        backgroundColor: colorMain,
        display: "flex",
        flexDirection: "row"
    },
    container: {
        flex: 1,
        height: ScreenHeight,
        backgroundColor: colorMain,
        borderRadius: 5,
        alignContent: "center"
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
        justifyContent: "flex-start"
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 24,
    },
    button: {
        borderColor: colorSecondary,
        color: colorSecondary,
        fontFamily: "Lalezar",
        fontSize: 20,
        borderWidth: 10,
        width: 200,
    },
    text: {
        fontSize: 24,
        padding: 10,
        borderRadius: 50,
        borderColor: "black",
        borderWidth: 3,
        fontWeight: 'bold',
        fontFamily: "Lalezar",
        direction: "rtl",
        color: 'black',
        backgroundColor: colorSecondary
    },
    img: {
        width: 300,
        height: 300,
    },
    desc: {
        fontWeight: 'bold',
        fontSize: 200,
        height: 100,
        width: 300
    },
    activity: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center"
    },
    buttonLabel: {
        fontSize: 20,
        fontFamily: "Lalezer",
        color: colorSecondary,
    },
    detail: {
        flex: 1,
        marginHorizontal:5,
        textAlign: "center",
        verticalAlign: "middle",
        backgroundColor:colorSecondary,
        color:"black",
        borderRadius:20,
        fontSize:24
    }
});

