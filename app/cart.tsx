import React, { useEffect, useState } from "react"
import { BackHandler, ScrollView, TouchableOpacity, View,StyleSheet,Text } from "react-native"
import * as Sqlite from "expo-sqlite"
import { colorMain, colorSecondary } from "./[id]"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAssets } from "expo-asset"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Image } from "expo-image"
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons"
import Plus from "../assets/images/add.svg"
import Minus from "../assets/images/minus.svg"
import { AntDesign, Entypo } from "@expo/vector-icons"
import { Button, Portal,Modal } from "react-native-paper"
import { router } from "expo-router"
import Qr from "../assets/images/qr_blue.svg"
import Logo from "../assets/images/logo.svg"

interface cart{
    cart_id: number
    count: number
    product_name:String
    product_price:number
    stock: number
}
export default function App() {
    const [cart,setCart] = useState<cart[]>([])
    const [visible,setVisible] = useState(false)
    const [assets, error] = useAssets([require("../assets/images/logoSecondary.png"),])
    const [db,setDb]=  useState<Sqlite.SQLiteDatabase>()
    useEffect(()=>{
        (async()=>{
            const db = await Sqlite.openDatabaseAsync('Products.db');
            const res:cart[] = await db.getAllAsync(`SELECT 
                cart.id AS cart_id,
                product.name AS product_name,
                product.price AS product_price,
                product.stock AS stock,
                cart.count
                FROM cart
                JOIN product ON cart.product_id = product.id;`)
                setCart(res)
                setDb(db)
        })()
    },[])

    const increaseOrder=(item:cart,index:number)=>{
        if (item.count < item.stock) {
            cart[index].count += 1
            setCart([...cart])
        } 
    }
    const decreseOrder=(item:cart,index:number)=>{
        if (item.count > 0) {
            cart[index].count -= 1
            setCart([...cart])
        } 
    }
    const clearDb=async()=>{
       await db?.execAsync(`delete from cart;`)
       setCart([])
       setVisible(false)
    }
    const checkout=async()=>{
        cart.forEach(async(item)=>{
            console.log(item)
            await db?.runAsync(`update cart set count= ? where id = ?`, item.count, item.cart_id)
        })
        router.push({ pathname: "/checkout", params: { cost: cart.reduce((acc, obj) => acc + obj.product_price * obj.count, 0) } })

    }
    return (
        <SafeAreaView style={{ backgroundColor: colorSecondary, width: "100%", height: "100%" }}>
                <View style={styles.header}>
                    {/* <Button contentStyle={{ height: 70 }} mode="outlined" onTouchStart={goProductDetail} labelStyle={styles.buttonLabel} style={styles.button}>لینک محصول</Button> */}
                    {assets ? <Image source={assets[0]} style={{ width: 220, height: 80,marginRight:5 }} /> : <></>}
                    <TouchableOpacity onPressIn={() => router.push("/")} >
                        <FontAwesome style={{ paddingHorizontal: 20 }} color={colorMain} name="home" size={72} />
                    </TouchableOpacity>
                    <TouchableOpacity onPressIn={() => BackHandler.exitApp()} style={styles.exit}>
                        <MaterialCommunityIcons color="#ffffffff" name="location-exit" size={48} />
                    </TouchableOpacity>
                </View>
                <View style={styles.main}>
                <Portal>
                    <Modal  visible={visible} onDismiss={() => setVisible(false)} style={{ direction:"rtl" }} contentContainerStyle={{backgroundColor:"white",borderRadius:10,padding:5,marginHorizontal:20}}>
                        <Text style={{fontSize:18}}>ایا مطمئنید میخواهید تمامی کالا ها رو سبد حذف شوند ؟</Text>
                        <View style={{ marginTop:20,display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                            <Button style={{marginLeft:5}} onPress={() => setVisible(false)} mode="contained" buttonColor="#ff0000ff">خیر</Button>
                            <Button onPress={clearDb} mode="contained" buttonColor="#31af34ff">بله</Button>
                        </View>
                    </Modal>
                </Portal>
                <ScrollView style={styles.container}>
                    <View style={{borderWidth:1.5,borderColor:"black"}}/>
                    {cart.map((item, index) => (
                        <View key={index} style={{ display: "flex" }}>
                            <View style={{ display: "flex", flexDirection: "row", direction: "rtl" }}>
                                <Text style={{ fontSize: 26, marginLeft: 5 }}>.{index + 1}</Text>
                                <Text style={{ fontSize: 24 }}>{item.product_name}</Text>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 18, marginLeft: 5, borderWidth: 1, padding: 5,borderRadius:5 }}>
                                    {(item.product_price * item.count).toLocaleString("en-us")} تومان
                                </Text>
                                <Text style={{ fontSize: 18 }}>{item.count} عدد </Text>
                                <View style={{ display: "flex", flexDirection: "row-reverse" }}>
                                    <Plus onPress={() => increaseOrder(item, index)} width={48} height={48} />
                                    <Minus onPress={() => decreseOrder(item, index)} width={48} height={48} />
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <View style={{borderWidth:2,borderColor:"black"}}/>
                <View style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                    <Text style={{fontSize:44}}>مجموع</Text>
                    <Text style={{fontSize:16,borderColor:"black",borderWidth:1,paddingHorizontal:30,borderRadius:5}}>تومان {(cart.reduce((acc, obj) => acc + obj.product_price*obj.count, 0)).toLocaleString("en-us")}</Text>
                </View>
                </View>
                <View style={{"display":"flex",flexDirection:"row-reverse",justifyContent:"center",alignItems:"center"}}>
                <TouchableOpacity onPress={() => checkout()} style={{ backgroundColor: "green", padding: 15, borderEndEndRadius: 40, borderTopEndRadius: 40, marginLeft: 5, borderStartStartRadius: 15, borderBottomLeftRadius: 15, paddingHorizontal: 60 }}><AntDesign size={25} color="white" name="check" /></TouchableOpacity>
                <Qr onPress={() => router.push("/scanner")} />
                <TouchableOpacity onPress={() => { setVisible(true) }} style={{ backgroundColor: "red", padding: 15, borderEndEndRadius: 15, borderTopEndRadius: 15, marginRight: 5, borderStartStartRadius: 40, borderBottomLeftRadius: 40, paddingHorizontal: 40 }}><Entypo size={25} color="white" name="cross" /></TouchableOpacity>
                </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    main: {
        margin:10,
        borderRadius:20,
        backgroundColor:"white",
        marginVertical: 5,
        flex:1,
        padding:10
    },
    header: {
        justifyContent:"space-around",
        alignItems:"center",
        backgroundColor: colorSecondary,
        marginTop:5,
        display: "flex",
        flexDirection: "row"
    },
    container: {
        flex: 1,
    },
    exit:{
        backgroundColor:"#f44336ff",
        borderRadius:50,
        padding:5
    },
})