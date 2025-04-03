import { View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, ActivityIndicator, TextInput } from "react-native-paper"
import Color from "../constants/Colors"
import { useEffect, useState } from "react";
import { getItemAsync, setItem, setItemAsync } from "expo-secure-store";
import { FontAwesome } from "@expo/vector-icons";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import Avatar from "../assets/images/avatar.svg";
import { router } from "expo-router";
import {  verifyOtp } from "./utils"
import { useLocalSearchParams } from "expo-router/build/hooks";
import { Platform } from "react-native";
import Colors from "../constants/Colors";

export default function App() {
    const [loading, setLoading] = useState(false)
    const [logined, setLogined] = useState(false)
    const {phone} = useLocalSearchParams<{phone:string}>()
    const [otp,setOtp] = useState("")
    const [timer,setTimer] = useState(120)
    const [assets, error] = useAssets([
        require("../assets/images/logoSecondary.png"),
    ])
    useEffect(() => {
        
        (async () => {
            setLogined((await getItemAsync("logined") === "true"));
        })()
    }, [])
    useEffect(() => {
        if (timer > 0) {
            const id = setTimeout(() => {
                if (timer <= 0) {
                    (async () => await setItemAsync("timer", "0"))()
                    clearInterval(id)
                    setLoading(false)
                } if (timer == 120) {
                    (async () => await setItemAsync("timer", "120"))()
                    setTimer(timer - 1)
                } else {
                    setTimer(timer - 1)
                }
            }, 1000)
        }
    }, [timer])
    if (error) {
        return (
            <View><Text>{error.message}</Text></View>
        )
    }
    if (logined) {
        return (
            <View><Text>Logined</Text></View>
        )
    }
    const onSubmit = async () => {
        if(!loading){
            setLoading(true)
            setTimer(120)
            console.log(otp)
            let customer = await verifyOtp(phone, otp)
            setItemAsync("name",customer.username)
            setItemAsync("email",customer.email)
            setItemAsync("id",customer.id.toString())
            setItemAsync("phone",phone)
            router.push("/profile");
        }
    }
    return (
        <SafeAreaView>
            <View style={{ height: "100%", backgroundColor: Color.light.background }}>
                <View style={{ marginTop: 10, display: "flex", flexDirection: "row", justifyContent: "space-around", backgroundColor: Color.light.background }}>
                    {(assets && assets.length != 0) ? <Image contentFit="contain" source={assets![0]} style={{ width: 174, height: 80 }} /> : <></>}
                    <View onTouchStart={() => router.push("/")} style={{ backgroundColor: Color.light.secondary, justifyContent: "center", alignContent: "center", borderRadius: 20 }}>
                        <FontAwesome style={{ paddingHorizontal: 20 }} color="white" name="home" size={36} />
                    </View>
                </View>
                <View style={{ flex: 1, backgroundColor: "white", margin: 20, direction: "rtl", padding: 10 }}>
                    <View style={{ marginVertical: 20, display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row", backgroundColor: "white" }}>
                        <Avatar width={150} height={150} />
                        <Text style={{ color: "#008000ff", fontSize: 64 }}>کاربری</Text>
                    </View>
                    <Text style={{ fontSize: 36, fontWeight: "800", marginBottom: 20,color:"black" }}>ورود</Text>
                    <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800",color:"black" }}>کد ارسالی</Text>
                    </View>
                    <View style={{ direction: "ltr", backgroundColor: "white" }}>
                        {Platform.OS=="android"?<TextInput
                            style={[{ height: 45 }]}
                            mode="outlined"
                            placeholder={"1234"}
                            keyboardType='number-pad'
                            placeholderTextColor={'#dddddd'}
                            textColor="black"
                            contentStyle={{backgroundColor:"white",borderWidth:1,borderRadius:4,borderColor:"grey"}}
                            onChangeText={(s)=>{console.log(s);setOtp(s)}}
                            value={otp}
                        autoComplete="sms-otp" />:<TextInput autoComplete="one-time-code" 
                            style={[{ height: 45 }]}
                            placeholder={"1234"}
                            textAlign="center"
                            textColor="black"
                            contentStyle={{backgroundColor:"white",borderWidth:1,borderRadius:4,borderColor:"grey"}}
                            keyboardType='number-pad'
                            mode="outlined"
                            placeholderTextColor={'#dddddd'}
                            onChangeText={(s)=>{console.log(s);setOtp(s)}}
                            value={otp}
                        />}
                        
                    </View>
                    {timer>0 && loading ? <Button disabled={timer>0 && loading} onTouchStart={onSubmit} style={{ borderRadius: 5,marginTop:40 }} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" ><ActivityIndicator color={Colors.light.secondary} /></Button> :
                        <Button onTouchStart={onSubmit} style={{ borderRadius: 5,marginTop:40 }} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" >تایید
                        </Button>
                    }
                    {timer>0?
                    <Text style={{textAlign:"center",marginTop:15,color:"black"}}>
                    مانده تا دریافت مجدد کد  {String(Math.floor(timer/60)).padStart(2,"0")}:{String(timer%60).padStart(2,"0")}
                    </Text>:null
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}