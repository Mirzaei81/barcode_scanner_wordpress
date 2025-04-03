import { SafeAreaView } from "react-native-safe-area-context";
import { colorMain, colorSecondary } from "./[id]";
import Success from "../assets/images/success.svg"
import Avatar from  "../assets/images/avatar.svg"
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import { BackHandler,  StyleSheet, TouchableOpacity, View,Text } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { deleteItemAsync, getItemAsync } from "expo-secure-store";
import { Button } from "react-native-paper";

export default function name() {
    const [assets, error] = useAssets([require("../assets/images/logoSecondary.png"),])
    const [username,setUsername] = useState("")
    const [orderId,setOrderId] = useState("")
    useEffect(()=>{
        (async()=>{
            let name = await getItemAsync("name")
            let familyName = await getItemAsync("lastName")??""

            const id = await getItemAsync("orderId")
            setOrderId(id??"")
            await deleteItemAsync("orderId")
            setUsername(name+" "+familyName)
        })()
    },[])
    if(assets==undefined)return
    return (
        <SafeAreaView style={{ backgroundColor: colorSecondary, width: "100%", height: "100%" }}>
            {assets ? <Image source={assets[0]} style={{ width: 220, height: 80,alignSelf:"center",marginTop:10 }} /> : <></>}
            <View style={{display:'flex',flexDirection:"row",justifyContent:"space-around",direction:"rtl",marginTop:10,borderBottomWidth:5,paddingBottom:5,marginHorizontal:5}}>
                <Avatar onTouchStart={()=>router.replace("/profile")} width={100} height={100} style={{alignSelf:"center"}} />
                <View>
                    <TouchableOpacity onPressIn={() => BackHandler.exitApp()} style={styles.exit}>
                        <MaterialCommunityIcons color="#ffffffff" name="location-exit" size={48} />
                    </TouchableOpacity>
                    <Success width={64} height={64} />
                </View>
                <View style={{backgroundColor:colorMain,borderRadius:16,justifyContent:"center"}}>
                    <FontAwesome onPress={() => router.replace("/")} style={{ paddingHorizontal: 20 }} color="white" name="home" size={72} />
                </View>
            </View>
            <View style={{display:"flex",alignItems:"center",paddingBottom:10,borderBottomWidth:5}}>
                <Text style={{fontSize:24,fontWeight:"700"}}>خانم/اقای {username}</Text>
                <Text style={{fontSize:24,fontWeight:"700"}}>از خرید شما سپاسگذاریم</Text>
                <Text style={{fontSize:24,fontWeight:"700"}}>شماره سفارش شما {orderId}</Text>
            </View>
            <View style={{display:"flex",flexDirection:"row",justifyContent:"space-around",direction:"rtl",marginVertical:40}}>
                <Button style={{borderRadius:5}} buttonColor="#407120ff" mode="contained">پشتیبانی واتساپ</Button>
                <Button style={{borderRadius:5}} buttonColor="#4d4d4dff" mode="contained">ارسال کوپن تخفیف</Button>
            </View>
        
            <Button mode="contained">باشگاه مشتریان</Button>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    exit:{
        backgroundColor:"#f44336ff",
        borderRadius:50,
        padding:5
    },

})