import { Text, View } from '@/components/Themed';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router, useNavigation } from 'expo-router';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, TouchableOpacity,Dimensions,Vibration} from 'react-native';
import { getProductBySKU } from './utils';
import BarcodeMask from "react-native-barcode-mask"
import {ActivityIndicator, Portal, Snackbar} from "react-native-paper"
import {Icon} from "react-native-paper"
import * as SQLite from 'expo-sqlite';


const colorMain = "#016bb7"
const colorSecondary = "#016bb7"
const {height:ScreenHeight} = Dimensions.get("window");

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [error,setError] = useState("")
  const [visible,setVisible] = useState(false)
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [overlayVisible,setOverlayVisible] = useState(true)
  const [db,setDb]= useState<SQLite.SQLiteDatabase>()
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation()
  useEffect(()=>{
      (async () => {
        const db = await SQLite.openDatabaseAsync('Products.db');
        setDb(db);
      })()
    setOverlayVisible(true)
    setIsLoading(false)
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>نیاز به اجازه شما برای استفاده از دوربین داریم</Text>
        <Button onPress={requestPermission} title="اجازه دادن" />
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
      console.log(result.data)
      if(result.data.length==14){
        barcodeId= result.data.slice(0, -6);
      }
      else{
        barcodeId= result.data
      }
      let firstRow: { Count: number }|null = null
      try{
        firstRow  = (await db?.getFirstAsync("SELECT COUNT(*) AS Count FROM product WHERE sku = ?", barcodeId))!
        console.log(firstRow)
      }catch(e){
        console.log(e)
      }
      if(firstRow && firstRow.Count!=0){
        setOverlayVisible(false)
        router.push(`/${barcodeId}`)
      }
      if(barcodeId.length==8){
        console.log(barcodeId.length)
        const products = await getProductBySKU(barcodeId)
        console.log(products)
        if (products && products.length > 0) {
          const product = products[0]
          const protectAttr = product.attributes.filter(attr => attr.name.includes("مراقبت"))
          let atter = null
          if (protectAttr.length > 0 && protectAttr[0].options && protectAttr[0].options.length > 0) {
            atter = protectAttr[0].options[0]
          }
          const dim = product.dimensions?.length + "x" + product.dimensions?.width + "x" + product.dimensions?.height + "cm"
          try{
            await db?.runAsync(`
            insert into product (id,sku,name,price,brand,attrbute,short_desc,dimentions,weight,stock,link) Values (?,?,?,?,?,?,?,?,?,?,?)`,
              product.id,product.sku, product.name, product.price, product.brands[0]?.name ?? "", atter, product.short_description, dim, product.weight, product.stock_quantity, product.permalink
            )
            setOverlayVisible(false)
            router.push(`/${product.id}`)
          }catch (e){
            setError(e.toString())
            setOverlayVisible(false)
          }
        }else{
          setTimeout(() => setVisible(true), 200)
        }
      }
      else {
        setTimeout(() => setVisible(true), 200)
      }
      setTimeout(() => setIsLoading(false), 300)
    }
  }

  return (
      <View style={styles.container}>
      {error != "" ? <Snackbar onDismiss={() => setError("")} visible={error != ""}>{error}</Snackbar> : null}
        <CameraView
          onBarcodeScanned={BarcodeCallback}
          active={!isLoading}
          style={styles.camera} facing={facing}>
        <Portal>
          {(()=>{
            if (overlayVisible) {
              return (
                <>
                  <Snackbar
                    visible={visible}
                    style={{ direction: "rtl" }}
                    onDismiss={() => setVisible(false)}>
                    این محصول در سایت پیدا نشد
                  </Snackbar>
                  {isLoading ? <ActivityIndicator style={styles.activity} color={colorMain} size={96} /> : <BarcodeMask width={300} height={300} />}
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

