import { Text, View } from '@/components/Themed';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { useState,useRef, useEffect } from 'react';
import { Button, Platform, StyleSheet, TouchableOpacity,ScrollView,Dimensions,Vibration,Animated} from 'react-native';
import { Image } from 'expo-image';
import { getProductBySKU } from './utils';
import { Product } from './types';
import WebView from 'react-native-webview';
import BarcodeMask from "react-native-barcode-mask"
import DomParser from   "react-native-html-parser"
import {ActivityIndicator,Snackbar} from "react-native-paper"
import {Icon} from "react-native-paper"

const rtlWrapper = `<div style="direction: rtl">`
const colorMain = "#016bb7"
const colorSecondary = "#016bb7"
const {height:ScreenHeight,width:ScreenWidth} = Dimensions.get("window");
const maskRowHeight = Math.round((ScreenHeight - 300) / 20);
const maskColWidth = (ScreenWidth - 300) / 2;

export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [product, setProduct] = useState<Product>()
  const [visible,setVisible] = useState(false)
  const [attr, setAttr] = useState("")
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [desc,setDesc] = useState("")


  const navigation = useNavigation()
  const scrollRef= useRef<ScrollView>(null);
  useEffect(()=>{
    setIsLoading(false)
    navigation.setOptions({
      headerShown: false 
    })
  },[])

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function BarcodeCallback(result:BarcodeScanningResult){
    if(!isLoading){
      Vibration.vibrate()
      setIsLoading(true)
      let barcodeId:string;
      if(result.data.length==14){
        barcodeId= result.data.slice(0, -6);
      }
      else{
        barcodeId= result.data
      }

      const products = await getProductBySKU(barcodeId)
      console.log(products.length)
      if(products.length>0){
        const product = products[0]
        console.log(product)
        const protectAttr =  product.attributes.filter(attr=>attr.name.includes("مراقبت"))
        if (protectAttr && protectAttr[0].options && protectAttr[0].options.length > 0) {
          setAttr(protectAttr[0].options[0])
        }
        setProduct(product)
        // scrollRef.current?.scrollToEnd({animated:true})
      }
      else{
        setVisible(true)
      }
      setTimeout(()=>setIsLoading(false),5000)
    }
  }

  return (
    <ScrollView ref={scrollRef}  scrollEnabled={product!=null} style={styles.main}>
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={BarcodeCallback}
          active={!isLoading}
          barcodeScannerSettings={{
            barcodeTypes: ["itf14", "qr"]
          }}  style={styles.camera} facing={facing}>
          {/* <Snackbar
            visible={visible}
            style={{direction:"rtl"}}
            onDismiss={() => setVisible(false)}>
            محصولی پیدا نشد
          </Snackbar> */}
          {isLoading?<ActivityIndicator style={styles.activity} color={colorSecondary}/>:<BarcodeMask width={300} height={100} />}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Icon  size={96} color="white" source="camera-flip"/>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
      <View style={styles.container}>
        <Image style={styles.img} source={product?.images[0].src}></Image>
        <Text style={styles.text}>قیمت: {product?.price}</Text>
        <Text style={styles.text}>برند: {product?.brands[0].name}</Text>
        <Text style={styles.text}>وزن: {product?.weight}</Text>
        {attr == "" ? <></> : <Text style={styles.text}>{attr}</Text>}
        <Text style={styles.text}>شناسه محصول: {product?.sku}</Text>
        
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main:{
    marginVertical:5,
  },
  container: {
    flex: 1,
    height:ScreenHeight,
    backgroundColor:colorMain,
    alignContent:"center"
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    justifyContent:"flex-start"
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
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily:"Lalezar",
    color: 'white',
    backgroundColor:colorSecondary
  },
  img: {
    width: 100,
    height: 100,
  },
  desc: {
    fontWeight: 'bold',
    fontSize: 200,
    height: 100,
    width: 300
  },
  activity:{
    flex:1,
    justifyContent:"center",
    alignContent:"center"
  }
});

