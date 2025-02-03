import { Text, View } from '@/components/Themed';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router, useNavigation } from 'expo-router';
import { useState,useRef, useEffect } from 'react';
import { Button, Platform, StyleSheet, TouchableOpacity,ScrollView,Dimensions,Vibration,Animated} from 'react-native';
import { Image } from 'expo-image';
import { getProductBySKU } from './utils';
import { Product } from './types';
import WebView from 'react-native-webview';
import BarcodeMask from "react-native-barcode-mask"
import {ActivityIndicator, Portal, Snackbar} from "react-native-paper"
import {Icon} from "react-native-paper"
import {writeAsStringAsync,cacheDirectory} from 'expo-file-system'


export const productPath = cacheDirectory+"p.json"
const rtlWrapper = `<div style="direction: rtl">`
const colorMain = "#016bb7"
const colorSecondary = "#016bb7"
const {height:ScreenHeight,width:ScreenWidth} = Dimensions.get("window");
const maskRowHeight = Math.round((ScreenHeight - 300) / 20);
const maskColWidth = (ScreenWidth - 300) / 2;

export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [visible,setVisible] = useState(false)
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [overlayVisible,setOverlayVisible] = useState<boolean>(true);
  const [permission, requestPermission] = useCameraPermissions();


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
        await writeAsStringAsync(productPath,JSON.stringify(products[0]))
        setOverlayVisible(false)
        router.push("/product")
        // scrollRef.current?.scrollToEnd({animated:true})
      }
      else{
        setTimeout(() => setVisible(true), 3000)
      }
      setTimeout(()=>setIsLoading(false),3000)
    }
  }

  return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={BarcodeCallback}
          active={!isLoading}
          barcodeScannerSettings={{
            barcodeTypes: ["itf14", "qr"]
          }}  style={styles.camera} facing={facing}>
        <Portal>
          {(()=>{
            if (overlayVisible) {
              return (
                <>
                  <Snackbar
                    visible={visible}
                    style={{ direction: "rtl" }}
                    onDismiss={() => setVisible(false)}>
                    محصولی پیدا نشد
                  </Snackbar>
                  {isLoading ? <ActivityIndicator style={styles.activity} color={colorMain} size={96} /> : <BarcodeMask width={300} height={100} />}
                </>
              )
            }
          })()}
        </Portal>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Icon  size={96} color="white" source="camera-flip"/>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
  );
}

const styles = StyleSheet.create({
  main:{
  },
  container: {
    height:ScreenHeight,
    backgroundColor:colorMain,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    height:ScreenHeight,
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

