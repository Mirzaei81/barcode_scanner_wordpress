import { View,Text } from "@/components/Themed";
import { ActivityIndicator, Dimensions, PixelRatio, StyleSheet } from "react-native";
import { Button, Portal, Snackbar, TextInput } from "react-native-paper";
import {  colorMain, colorSecondary } from "./[id]";
import {Image, ImageBackground} from "expo-image"
import { useAssets } from "expo-asset";
import Person from "../assets/images/person.svg"
import Avatar from "../assets/images/avatar.svg"
import ScanMe from "../assets/images/scanMe.svg"
import QR from "../assets/images/qr.svg"
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getProductByName, getProductBySKU } from "./utils";
import { Product } from "./types";
import * as Sqlite from "expo-sqlite"

const WIDTH = Dimensions.get('screen').width;
const HEIGHT = Dimensions.get('screen').height;

export default function Index(){
    const [assets,e] = useAssets([
        require("../assets/images/Title.png"),
        require("../assets/images/bg.png"),
        ,

        ])
    const [name,setName]=useState("")
    const [sku,setSku]=useState("")
    const [db,setDb] =useState<Sqlite.SQLiteDatabase>()
    const [loading,setLoading ] = useState(false)
    const [error,setError] = useState("")
    useEffect(() => {
        (async () => {
            const db = await Sqlite.openDatabaseAsync('Products.db');
            setDb(db)
            try{
            await db.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS cart (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER not null,
                    history_id INTEGER not null,
                    count INTEGER NOT NULL CHECK(count >= -1),
                    is_active BOOLEAN NOT NULL DEFAULT 0,
                    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
                    FOREIGN KEY (history_id) REFERENCES history(id) ON DELETE CASCADE
                );
                CREATE TABLE IF NOT EXISTS cards( 
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    number TEXT Not NULL,
                    owner TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS product (
                    id INTEGER PRIMARY KEY NOT NULL,
                    sku INTEGER,
                    name TEXT NOT NULL,
                    price INTEGER,
                    brand TEXT,
                    attrbute TEXT,
                    short_desc TEXT,
                    dimentions TEXT,
                    weight INTEGER,
                    stock INTEGER,
                    link TEXT
                  );`);
            }catch (e){
                setError(e.toString())
            }
        })()
    }, [])
    useEffect(()=>{setLoading(false)},[loading])
    if(e || assets==null){
        return <View><Image source={require("../assets/images/icon.png")} /></View>
    }
    const searchProduct = async()=>{
        setLoading(true)
        if(name!=""){
            let dbProduct  =null
            try {
                dbProduct = await db?.getFirstAsync("select * from product  where name like ?", name)
                console.log(dbProduct)
                if (dbProduct) {
                    setLoading(false)
                    router.push(`/${dbProduct.id}`)
                    return
                }
            } catch (e) {
                setError(e.toString())
                return
            }
            const products: Product[] = await getProductByName(name)
            for (let product of products) {
                const protectAttr = product.attributes.filter(attr => attr.name.includes("مراقبت"))
                let atter = null
                if (protectAttr.length > 0 && protectAttr[0].options && protectAttr[0].options.length > 0) {
                    atter = protectAttr[0].options[0]
                }
                const dim = product.dimensions?.length + "x" + product.dimensions?.width + "x" + product.dimensions?.height + "cm"
                try {
                    await db?.runAsync(`
            insert into product (id,sku,name,price,brand,attrbute,short_desc,dimentions,weight,stock,link) Values (?,?,?,?,?,?,?,?,?,?,?)`,
                        product.id, product.sku, product.name, product.price, product.brands[0]?.name ?? "", atter, product.short_description, dim, product.weight, product.stock_quantity, product.permalink
                    )
                    setLoading(false)
                } catch (e) {
                    console.log(e.toString() + sku + "  there was an error")
                    setError(e.toString())
                }
            }
            router.push(`/${products[0].sku}`,{})

        }
        else if (sku != "") {
            let dbProduct = await db?.getFirstAsync("select * from product  where sku = ?", sku)
            console.log(dbProduct)
            if (dbProduct) {
                router.push(`/${dbProduct.sku}`)
                return
            }
            const products: Product[] = await getProductBySKU(sku)
            let product = products[0]
            if(product==null){
                console.log("not found")
                setError("محصول با ان شاسه یافت نشد")
                return;
            }
            const protectAttr = product.attributes.filter(attr => attr.name.includes("مراقبت"))
            let atter = null
            if (protectAttr.length > 0 && protectAttr[0].options && protectAttr[0].options.length > 0) {
                atter = protectAttr[0].options[0]
            }
            const dim = product.dimensions?.length + "x" + product.dimensions?.width + "x" + product.dimensions?.height + "cm"
            console.log(product.id)
            try {
                await db?.runAsync(`
            insert into product (id,sku,name,price,brand,attrbute,short_desc,dimentions,weight,stock,link) Values (?,?,?,?,?,?,?,?,?,?,?)`,
                    product.id, product.sku, product.name, product.price, product.brands[0]?.name ?? "", atter, product.short_description, dim, product.weight, product.stock_quantity, product.permalink
                )
                setLoading(false)
                router.push(`/${product.id}`)
            } catch (e) {
                console.log(e)
            }
            setLoading(false)
        }
        
    }
    
    return (
        <View>
            {error!=""?<Snackbar onDismiss={()=>setError("")} visible={error!=""}>{error}</Snackbar>:null}
            {loading ?
                <Portal>
                    <View style={[styles.activity, { backgroundColor: "transparent", vsibility: loading ? "visible" : "hidden" }]}>
                        <View style={{ backgroundColor: "white", padding: 34, borderRadius: 36, borderWidth: 1, alignSelf: "center", borderColor: colorSecondary }}>
                            <ActivityIndicator color={colorMain} size={64} />
                            <Text>در حال پردازش</Text>
                        </View>

                    </View>
                </Portal>
                : null}
            <ImageBackground style={{ width: WIDTH, height: HEIGHT }} source={assets[1]}>
                    <Person width={PixelRatio.getPixelSizeForLayoutSize(37.49)} height={PixelRatio.getPixelSizeForLayoutSize(93.15)} style={{position:"absolute",top:15,left:5}}/>
                        {assets ? <Image source={assets![0]} style={{ width: 194, height: 80,top:100,left:170}} /> : <></>}
                        <Text style={{color:"#f6d33c",position:"absolute",top:250,left:125,fontSize:32}}>به زردان خوش آمدی</Text>
                        <Text style={{color:"#f6d33c",position:"absolute",top:360,right:35,fontSize:22}}>نام محصول: </Text>
                        <TextInput onChangeText={(e)=>setName(e)} theme={{roundness:20}}  style={{borderRadius:20,position:"absolute",overflow:"hidden",top:350,left:30,width:WIDTH*0.57,height:50,backgroundColor:"white"}}></TextInput>
                        <Text style={{color:"#f6d33c",position:"absolute",top:430,right:45,fontSize:22}}>شناسه محصول:</Text>
                        <TextInput onChangeText={(e)=>(setSku(e))}  theme={{roundness:20}} style={{position:"absolute",overflow:"hidden",top:420,left:20,borderRadius:20,width:WIDTH*0.5,height:50,backgroundColor:"white"}}></TextInput>

                        <Button labelStyle={[styles.buttonLabel, { color: "white" }]} style={styles.button} onTouchStart={searchProduct}>جست و جو</Button>
                        <Avatar onTouchStart={()=>router.push("/profile")} width={PixelRatio.getPixelSizeForLayoutSize(45)} height={PixelRatio.getPixelSizeForLayoutSize(45)} style={{position:"absolute",bottom:250,left:235}}/>
                        <ScanMe onTouchStart={() => router.push("/scanner")} width={PixelRatio.getPixelSizeForLayoutSize(88)} height={PixelRatio.getPixelSizeForLayoutSize(56)} style={{position:"absolute",bottom:140,right:150}}/>
                        <QR  onTouchStart={() => router.push("/cart")} width={PixelRatio.getPixelSizeForLayoutSize(35)} height={PixelRatio.getPixelSizeForLayoutSize(40)} style={{position:"absolute",bottom:130,right:20}} />
                        <View style={styles.footer}>
                            <Text style={[styles.text,{color:"white"}]}>طراحی توسط امیر عرشیا میرزایی</Text>
                            <Text style={[styles.text, { color: colorSecondary }]}>کلیه حقوق این اپلیکیشن متعلق به فروشگاه زردان می باشد</Text>
                        </View>
            </ImageBackground>
        </View>
    )
}
const styles = StyleSheet.create({
    bgContainer:{
        flex:1
    },
    activity: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center"
    },
    footer:{
        position:"absolute",
        bottom:90,
        backgroundColor:"transparent",
        marginHorizontal:10
    },
    button: {
        position:"absolute",
        backgroundColor: colorSecondary,
        width: 150,
        height: 50,
        justifyContent: "center",
        display: "flex",
        bottom:330,
        left:50,
        borderRadius: 10
    },
    text: {
        fontSize:16,
        textAlign:"center",
    },
    image: {
        width:WIDTH,
        height:HEIGHT,
    },
    container:{
        // flex:1,
        // display:"flex",
        // justifyContent:"space-between",
        // alignItems:"center",
        // direction:"rtl",
        // backgroundColor:colorMain
    },
    buttonLabel: {
        fontSize: 18,
        fontFamily: 'Lalezar',
        color: colorSecondary,
        verticalAlign:"middle"
    },
})