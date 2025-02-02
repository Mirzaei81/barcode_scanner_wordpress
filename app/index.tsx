import { Text, View } from '@/components/Themed';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from 'expo-router';
import { useState,useRef, useEffect } from 'react';
import { Button, Platform, StyleSheet, TouchableOpacity,ScrollView,Dimensions,Vibration} from 'react-native';
import { Image } from 'expo-image';
import { getProductBySKU } from './utils';
import { Product } from './types';
import WebView from 'react-native-webview';
const rtlWrapper = `<div style="direction: rtl">`
const ScreenHeight = Dimensions.get("window").height;


export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [product, setProduct] = useState<Product>()
  const [attr, setAttr] = useState("")
  const [isLoading,setIsLoading] = useState<boolean>(false);
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
      setIsLoading(true)
      const barcodeId= result.data.slice(0, -6);
      console.log(result.data.length+ "\t"+result.data,"\t",barcodeId)
      const products = await getProductBySKU(barcodeId)
      console.log(products)
      Vibration.vibrate()
      if(products.length!=0){
        setProduct(products[0])
        const protectAttr =  product?.attributes.filter(attr=>attr.name.includes("مراقبت"))
        if (protectAttr && protectAttr[0].options && protectAttr[0].options.length > 0) {
          setAttr(protectAttr[0].options[0])
        }
        scrollRef.current?.scrollToEnd({animated:true})
      }
      setIsLoading(false)
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
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
        {
          Platform.OS === 'web'
            ? <div dangerouslySetInnerHTML={{ __html: product?.short_description! }} />
            :
            <View style={{ flex: 1, backgroundColor: "black", direction: "rtl" }}>
              <WebView
                style={styles.desc}
                originWhitelist={["*"]}
                textZoom={350}
                source={{ html: rtlWrapper + product?.short_description! + "</div>" }}
              />
            </View>
        }
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
    justifyContent: 'center',
    height:ScreenHeight,

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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  }
});

