import { Text, View } from '@/components/Themed';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import {  router, useNavigation } from 'expo-router';
import { useState,useRef,MutableRefObject, useEffect } from 'react';
import { Button, StyleSheet, TouchableOpacity} from 'react-native';
import { getProductBySKU } from './utils';
import  {writeAsStringAsync,cacheDirectory}from 'expo-file-system';

export const  productFileUri = cacheDirectory+"product.json"
export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const CameraRef:MutableRefObject<CameraView|null> = useRef(null);
  const navigation = useNavigation()
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
      const products = await getProductBySKU(barcodeId)
      console.log(productFileUri,cacheDirectory)
      if(products.length!=0){
        await writeAsStringAsync(productFileUri,JSON.stringify(products[0]))
        console.log("index.tsx:48\t"+Object.getOwnPropertyNames(products[0]))
        // console.log("index.tsx:48\t"+JSON.stringify(products[0]))
        router.push("/product")
      }
      "id,name,slug,permalink,date_created,date_created_gmt,date_modified,date_modified_gmt,type,status,featured,catalog_visibility,description,short_description,sku,price,regular_price,sale_price,date_on_sale_from,date_on_sale_from_gmt,date_on_sale_to,date_on_sale_to_gmt,on_sale,purchasable,total_sales,virtual,downloadable,downloads,download_limit,download_expiry,external_url,button_text,tax_status,tax_class,manage_stock,stock_quantity,backorders,backorders_allowed,backordered,low_stock_amount,sold_individually,weight,dimensions,shipping_required,shipping_taxable,shipping_class,shipping_class_id,reviews_allowed,average_rating,rating_count,upsell_ids,cross_sell_ids,parent_id,purchase_note,categories,tags,images,attributes,default_attributes,variations,grouped_products,menu_order,price_html,related_ids,meta_data,stock_status,has_options,post_password,global_unique_id,yoast_head,yoast_head_json,brands,_links "
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={BarcodeCallback}
        active={!isLoading}
        barcodeScannerSettings={{
        barcodeTypes:["itf14","qr"]
      }} ref={CameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
});

