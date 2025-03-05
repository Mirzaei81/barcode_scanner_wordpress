import { View,Text } from "@/components/Themed";
import { Dimensions, PixelRatio, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import {  colorSecondary } from "./[id]";
import {Image, ImageBackground} from "expo-image"
import { useAssets } from "expo-asset";
import Person from "../assets/images/person.svg"
import Avatar from "../assets/images/avatar.svg"
import ScanMe from "../assets/images/scanMe.svg"
import QR from "../assets/images/qr.svg"
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { getProductByName } from "./utils";
import { Product } from "./types";
import * as Sqlite from "expo-sqlite"

const WIDTH = Dimensions.get('screen').width;
const HEIGHT = Dimensions.get('screen').height;

export default function Index(){
    const [assets, error] = useAssets([
        require("../assets/images/Title.png"),
        require("../assets/images/bg.png"),
        ,

        ])
    const [name,setName]=useState("")
    const [sku,setSku]=useState("")
    useEffect(() => {
        (async () => {
            const db = await Sqlite.openDatabaseAsync('Products.db');
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
        })()
    }, [])
    if(error || assets==null){
        return <View><Image source={require("../assets/images/icon.png")} /></View>
    }
    const searchProduct = async()=>{
        if(name!=""){
            const p:Product[]= await getProductByName(name)
            console.log(p)
        }
        else if(sku!=""){
            const p:Product[]= await getProductByName(name)
            console.log(p)
        }
        
    }
    
    return (
        <View>
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
                        <QR onTouchStart={()=>router.push("/123")}  width={PixelRatio.getPixelSizeForLayoutSize(35)} height={PixelRatio.getPixelSizeForLayoutSize(40)} style={{position:"absolute",bottom:130,right:20}} />
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