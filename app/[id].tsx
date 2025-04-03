import { Text, View } from '@/components/Themed';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, BackHandler, ScrollView, TouchableOpacity,Share, Pressable, Vibration} from 'react-native';
import { Image } from 'expo-image';
import { ProductTable } from './types';
import WebView from 'react-native-webview';
import { openBrowserAsync } from "expo-web-browser"
import { useAssets } from 'expo-asset';
import * as Sqlite from "expo-sqlite"
import { getProductBySKU } from './utils';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Plus from "../assets/images/add.svg"
import Minus from "../assets/images/minus.svg"
import Cart from "../assets/images/cart.svg"
import Address from "../assets/images/link.svg"
import Qr from "../assets/images/qr_blue.svg"
import LottieView from 'lottie-react-native';
import { Portal, Snackbar } from 'react-native-paper';


export const colorMain = "#016bb7"
export const colorSecondary = "#f7d33d"
export const colorDanger = "#800101"
export const colorOnDanger = "#ffffff"

const descriptionWrapper = `<div style='border-radius: 1rem;padding-right:2rem;background-color:#f9f9f9ff;direction: rtl;font-size:52;font-weight:500;'>`

export default function App() {

    const [product, setProduct] = useState<ProductTable>()
    const [db,setDb]= useState<Sqlite.SQLiteDatabase>()
    const [count, setCount] = useState(0)
    const [initCount,setInitCount] = useState(0)
    const [assets, error] = useAssets([require("../assets/images/Title.png"),])
    const { id } = useLocalSearchParams<{ id: string }>();
    const animationRef = useRef<LottieView>(null);
    const [submited,setSubmited] = useState(false)
    const [Success,setSuccess] = useState(false)
    const [e,setE] = useState("")

    useEffect(() => {
        (async () => {
            const db = await Sqlite.openDatabaseAsync('Products.db');
            const product: ProductTable = (await db.getFirstAsync("Select * from product where id = ?", id))!;
            (async () => {
                const products = await getProductBySKU(product.sku+"")
                let cartDetail:{id:number,count:number}|undefined|null
                try{
                    cartDetail = await db?.getFirstAsync(`select * from cart where  product_id = ?;`,product!.id)
                }catch(e){
                    console.log(e,"get last cart value")
                }
                if (products&&products.length > 0) {
                    const Updatedproduct = products[0];
                    if (parseInt(Updatedproduct.price) != product.price) {
                        try{
                            await db?.runAsync(`update product set price= ? where id = ?`, Updatedproduct.price, id)
                        }catch(e){
                            console.log(e,"at update price ")
                        }
                        setProduct({...product,price:product.price}) 
                    }
                    if (Updatedproduct.stock_quantity != product.stock) {
                        try{
                            await db?.runAsync(`update product set stock= ? where id = ?`, Updatedproduct.stock_quantity, id)
                        }catch(e){
                            console.log(e,"at update stock")
                        }
                        console.log(product.stock)
                        setProduct({...product,stock:product.stock}) 
                    }
                }
                if(cartDetail){
                    setInitCount(cartDetail.count)
                    setCount(cartDetail.count)
                }
            })()
            setDb(db)
            setProduct(product)
            setSuccess(false)
        })()
    }, [])

    async function goProductDetail() {
    
        await openBrowserAsync(product?.link!);
    }
    async function submitCart() {
        if(count==0 && initCount==0){
            Vibration.vibrate()
            setE("تعداد نمیتواند برابر صفر باشد")
        }
        else if(!submited){
            animationRef.current?.play()
            setSubmited(true)
            setSuccess(true)
            const res:{is_in_cart:number}|undefined|null = await db?.getFirstAsync(`SELECT EXISTS (SELECT 1 FROM cart WHERE product_id = ? LIMIT 1) AS is_in_cart;`,product!.id)
            if(res==null || res.is_in_cart==0){
                 db!.runAsync(`INSERT INTO cart (product_id, history_id, count, is_active) VALUES (?, -1, ?, 1);`,product!.id,count).then((result)=>{
                    console.log(result.lastInsertRowId, result.changes);
                }).catch((e)=>console.log(e))
            }else{
                console.log("updating")
                const cartDetail:{id:number,count:number}|undefined|null = await db?.getFirstAsync(`select id,count cart where  product_id= ?;`,product!.id)
                console.log(cartDetail)
                if(cartDetail!.count+count<product!.stock){
                    Vibration.vibrate()
                    
                }
                await db?.runAsync(`UPDATE cart SET product_id= ? where id = ?;`,count,id)
            }
        }else{
            Vibration.vibrate()
            setE("تعداد تغییری نکرده")
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Portal>
                    <Snackbar style={{direction:"rtl",backgroundColor:"#ff0000ff"}} duration={3000} visible={e != ""} onDismiss={() => setE("")}>{e}</Snackbar>
                    <Snackbar style={{direction:"rtl",backgroundColor:"#38b23bff"}} duration={3000} visible={Success} onDismiss={()=>setSuccess(false)}>با موفقیت انجام شد</Snackbar>
                </Portal>
                <ScrollView style={styles.container}>
                    <View style={styles.header}>
                        {/* <Button contentStyle={{ height: 70 }} mode="outlined" onTouchStart={goProductDetail} labelStyle={styles.buttonLabel} style={styles.button}>لینک محصول</Button> */}
                        {assets ? <Image source={assets[0]} style={{ width: 195, height: 80 }} /> : <></>}
                        <TouchableOpacity onPressIn={() =>  router.push("/")} >
                            <FontAwesome  style={{ paddingHorizontal: 20 }} color={colorSecondary} name="home" size={72} />
                        </TouchableOpacity>
                        <TouchableOpacity onPressIn={()=>BackHandler.exitApp()}  style={styles.exit}>
                            <MaterialCommunityIcons  color="#ffffffff" name="location-exit" size={48} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.main}>
                        <View style={styles.row}>
                            <Text style={styles.text}>نام </Text><Text style={styles.detail}>{product?.name}</Text>
                        </View>
                        <View style={[styles.row, { flexDirection: 'row-reverse' }]}>
                            <Text style={styles.text}>برند </Text><Text style={styles.detail}> {product?.brand==""?"ایکیا":product?.brand}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.text}>فی</Text><Text style={styles.detail}> {Intl.NumberFormat("en-us").format(product?.price!)}  تومان</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.text}>شناسه</Text><Text style={styles.detail}>{product?.id}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.text}>ابعاد </Text><Text style={styles.detail}>  {product?.dimentions=="xxcm"?"نامعین":product?.dimentions} </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.text}>وزن </Text><Text style={styles.detail}>  {product?.weight==0?"ناچیز":`${product?.weight} kg`} </Text>
                        </View>
                        <View style={[styles.row, { flexDirection: 'row-reverse' }]}>
                            <Text style={styles.text}>موجودی </Text><Text style={styles.detail}> {product?.stock}</Text>
                        </View>
                        {product?.attrbute ?
                            <View style={[styles.row, { justifyContent: "center" }]}>
                                <Text style={styles.text}>{product?.attrbute}</Text>
                            </View>
                            : null
                        }
                        <View style={[styles.row, { height: 170,flex:1 }]}>
                            <View style={{ backgroundColor: "white" }}>
                                <Text style={styles.text}>معرفی</Text>
                            </View>
                            <WebView
                                style={[styles.container,{backgroundColor:"white"}]}
                                originWhitelist={['*']}
                                source={{ html: descriptionWrapper + product?.short_desc + "</div>" }}
                            />
                        </View>
                        <View pointerEvents='box-none' style={{ flex:1,display: "flex", alignItems: "center",borderRadius:10, backgroundColor: "white", flexDirection: "row-reverse", justifyContent: "space-around" }}>
                            <View style={{display: "flex", alignItems: "center",flexDirection:"row-reverse", backgroundColor: "white",}}>
                                <Text>تعداد</Text>
                                <Text style={styles.count}>{count}</Text>
                            </View>
                            <Minus onPress={() => count > 0 ? (setCount(count - 1), setSubmited(false)) : null} width={48} height={48} />
                            <Plus onPress={() => { (product && count < product?.stock) ? (setCount(count + 1),setSubmited(false)) : null }} width={48} height={48} />
                            {/* {submited?<Submit color="grey" fill="grey"  width={72} height={72}/>:<Submit onPressIn={submitCart} width={72} height={72}/>} */}
                            <Pressable onPress={submitCart}>
                            <LottieView
                                source={require("../assets/animation/tick.json")}
                                ref={animationRef}
                                style={{ width: 100, height: 100 }}
                                progress={1}
                                autoPlay={false}
                                loop={false}
                            />
                            </Pressable>
                        </View>
                        <View  style={{ flex:1,display: "flex", alignItems: "center",borderRadius:10, backgroundColor: "white", flexDirection: "row-reverse", justifyContent: "space-around" }}>
                            <Qr onPressIn={()=>router.push("/scanner")} width={96} height={96}/>
                            <Address onPressIn={goProductDetail} width={96} height={96}/>
                            <Cart onPressIn={()=>router.push("/cart")} width={96} height={96}/>
                        </View>
                    </View>
                </ScrollView >
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    exit:{
        backgroundColor:"#f44336ff",
        borderRadius:50,
        padding:5
    },
    count:{
        marginRight:10,
        paddingHorizontal:45,
        borderRadius:5,
        padding:5,
        borderColor:"#016bb7ff",
        borderWidth:1
    },
    main: {
        margin:15,
        borderRadius:20,
        backgroundColor:"white",
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
        backgroundColor:"white"
    },
    header: {
        justifyContent:"space-around",
        alignItems:"center",
        backgroundColor: colorMain,
        marginTop:5,
        display: "flex",
        flexDirection: "row"
    },
    container: {
        flex: 1,
        paddingTop:5,
        backgroundColor: colorMain,
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
        borderWidth: 8,
        width: 200,
    },
    text: {
        fontFamily: 'Lalezar',
        fontSize: 18,
        fontWeight:"600",
        direction: "rtl",
        color: 'black',
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
        borderColor:"#016bb7ff",
        borderWidth:1.5,
        backgroundColor:"white",
        color:"black",
        borderRadius:3,
        fontSize:24
    }
});

