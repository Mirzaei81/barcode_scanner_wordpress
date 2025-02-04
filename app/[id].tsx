import { Text, View } from '@/components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet,Dimensions,BackHandler} from 'react-native';
import { Image } from 'expo-image';
import { ProductTable } from './types';
import WebView from 'react-native-webview';
import { Button } from 'react-native-paper';
import {openBrowserAsync} from "expo-web-browser"
import { useAssets } from 'expo-asset';
import * as Sqlite from "expo-sqlite"
import { getProductBySKU } from './utils';

export const colorMain = "#016bb7"
export const colorSecondary = "#f7d33d"
export const colorDanger = "#800101"
export const colorOnDanger = "#ffffff"

const {height:ScreenHeight} = Dimensions.get("window");
const descriptionWrapper = `<div style='border-radius: 5rem;padding-right:40;background-color:${colorSecondary};direction: rtl;font-size:54;font-weight:900;'>`

export default function App() {

  const [product, setProduct] = useState<ProductTable>()
  const [assets,error]= useAssets([require("../assets/images/Title.png")])
  const {id}=useLocalSearchParams<{id:string}>();

  useEffect(()=>{
    (async()=>{
          const db = await Sqlite.openDatabaseAsync('Products.db');
          const product: ProductTable = (await db.getFirstAsync("Select * from product_db where id = ?", id))!;
          (async () => {
              const products = await getProductBySKU(id)
              if (products.length > 0) {
                  const Updatedproduct = products[0];
                  if (parseInt(Updatedproduct.price) != product.price) {
                      await db?.runAsync(`update table product_db set price= ? where id = ?`, Updatedproduct.price, id)
                  }
                  if (Updatedproduct.stock_quantity != product.stock) {
                      await db?.runAsync(`update table product_db set stock= ? where id = ?`, Updatedproduct.stock_quantity, id)
                  }
              }
          })()
          setProduct(product)
      })()
  }, [])

  async function goProductDetail(){
    await openBrowserAsync(product?.link!);
  }

  return (
      <View style={styles.container}>
          <View style={styles.header}>
              <Button contentStyle={{height:70}} mode="outlined" onTouchStart={goProductDetail} labelStyle={styles.buttonLabel} style={styles.button}>لینک محصول</Button>
              {assets?<Image source={assets[0]} style={{ width: 195, height: 80 }} />:<></>}
          </View>

          <View style={styles.row}>
              <Text style={styles.text}>شناسه محصول </Text><Text style={styles.detail}>{product?.id}</Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>نام </Text><Text style={styles.detail}>{product?.name}</Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>قیمت </Text><Text style={styles.detail}> {Intl.NumberFormat("en-us").format(product?.price!)}  تومان</Text>
          </View>

          <View style={[styles.row,{flexDirection:'row-reverse'}]}>
                  <Text style={styles.text}>برند </Text><Text style={styles.detail}> {product?.brand}</Text>
                  <Text style={styles.text}>موجودی </Text><Text style={styles.detail}> {product?.stock}</Text>
          </View>

          {product?.attrbute ?
              <View style={styles.row}>
                  <Text style={styles.text}>{product?.attrbute}</Text>
              </View>
              : null 
          }
          <View style={[styles.row,{height:170}]}>
              <View style={{backgroundColor:colorMain}}>
                  <Text style={styles.text}>معرفی</Text>
              </View>
              <WebView
                  style={styles.container}
                  originWhitelist={['*']}
                  source={{ html: descriptionWrapper + product?.short_desc + "</div>" }}
              />
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>ابعاد </Text><Text style={styles.detail}>  {product?.dimentions} </Text>
          </View>
          <View style={styles.row}>
              <Text style={styles.text}>وزن </Text><Text style={styles.detail}>  {product?.weight}  kg</Text>
          </View>
          <View style={{display:"flex",alignItems:"center",backgroundColor:colorMain,flexDirection:"row-reverse",justifyContent:"space-around"}}>
              <Button labelStyle={[styles.buttonLabel,{color:"black"}]}  style={{backgroundColor:colorSecondary,width:200,borderRadius:20}} onTouchStart={() => router.push("/main")}>اسکن</Button>
              <Button labelStyle={[styles.buttonLabel,{color:colorOnDanger}]}  style={{backgroundColor:colorDanger,width:100,borderRadius:40}} onTouchStart={() =>BackHandler.exitApp()}>خروج</Button>
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
    main: {
        marginVertical: 5,
    },
    fotterBtn:{
        backgroundColor: colorSecondary,
        borderWidth: 10,
        width: 200,
    },
    row: {
        flexDirection: "row-reverse",
        margin: 7,
        backgroundColor: colorMain
    },
    header: {
        backgroundColor: colorMain,
        marginTop:5,
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
        borderWidth: 8,
        width: 200,
    },
    text: {
        fontSize: 24,
        padding: 10,
        borderRadius: 8,
        borderColor: "black",
        borderWidth: 3,
        fontWeight: 'bold',
        fontFamily:'Lalezar',
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
        padding:12,
        fontFamily: 'Lalezar',
        color: colorSecondary,
    },
    detail: {
        flex: 1,
        marginHorizontal:5,
        textAlign: "center",
        verticalAlign: "middle",
        backgroundColor:colorSecondary,
        color:"black",
        borderRadius:10,
        fontSize:24
    }
});

