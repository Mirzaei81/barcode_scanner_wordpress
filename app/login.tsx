import { View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Checkbox, Button, ActivityIndicator } from "react-native-paper"
import Color from "../constants/Colors"
import { useEffect, useState } from "react";
import { getItem, getItemAsync, setItem, setItemAsync } from "expo-secure-store";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import Avatar from "../assets/images/avatar.svg";
import { router } from "expo-router";
import CountryCodeDropdownPicker from 'react-native-dropdown-country-picker'
import { sendOtp } from "./utils"
import { ScrollView, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { deleteAsync } from "expo-file-system";
export default function App() {
    const [selected, setSelected] = useState('+98')
    const [loading,setLoading]  = useState(false)
    const [country, setCountry] = useState('')
    const [phone, setPhone] = useState<string>("")
    const [logined, setLogined] = useState(false)
    const [remember, setRemember] = useState(false)
    const [timer,setTimer] = useState(0)
    const [assets, error] = useAssets([
        require("../assets/images/logoSecondary.png"),
    ])
    useEffect(() => {
        (async () => {
            setLogined((await getItemAsync("logined") === "true"));
            const time = await  getItemAsync("timer")
            if (time) {
                let counter= Number.parseInt(time, 10)
                if(counter>0){
                    setTimer(counter)
                }
            }
        })()
    }, [])

    useEffect(() => {
        const id = setInterval(() => {
            if (timer == 0) {
                (async()=>setItemAsync("timer","0"))()
                clearInterval(id)
            } else if (timer == -1) {
                setTimer(120)
            } else {
                setTimer(timer - 1)
            }
        }, 1000)
        return () => clearInterval(id)
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
        setLoading(true)
        if(phone.length==10){
            await sendOtp(phone)
            router.push({pathname:"/otp",params:{phone}})
        }
            
    }
    return(
        <SafeAreaView>
            <View style={{ height: "100%", backgroundColor: Color.light.background }}>
                    <View style={{ marginTop: 10, display: "flex", flexDirection: "row", justifyContent: "space-around", backgroundColor: Color.light.background }}>
                        {(assets && assets.length != 0) ? <Image contentFit="contain" source={assets![0]} style={{ width: 174, height: 80 }} /> : <></>}
                        <View onTouchStart={() => router.push("/")} style={{ backgroundColor: Color.light.secondary, justifyContent: "center", alignContent: "center", borderRadius: 20 }}>
                            <FontAwesome style={{ paddingHorizontal: 20 }} color="white" name="home" size={36} />
                        </View>
                    </View>
                    <ScrollView style={{ flex: 1, backgroundColor: "white", margin: 20, direction: "rtl", padding: 10 }}>
                        <View style={{ marginVertical: 20, display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row", backgroundColor: "white" }}>
                            <Avatar width={150} height={150} />
                            <Text style={{ color: "#008000ff", fontSize: 64 }}>کاربری</Text>
                        </View>
                        <Text style={{ fontSize: 36, fontWeight: "800", marginBottom: 20,color:"black" }}>ورود</Text>
                        <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                            <Text style={{ fontSize: 16, fontWeight: "800",color:"black" }}>استفاده از موبایل</Text>
                        </View>
                        <View style={{ direction: "ltr", backgroundColor: "white" }}>
                            <CountryCodeDropdownPicker
                                selected={selected}
                                setSelected={setSelected}
                                setCountryDetails={setCountry}
                                phone={phone}
                                setPhone={setPhone}
                                phoneStyles={{ height: 45 }}
                            />
                        </View>
                        <View style={{ backgroundColor: "white", flexDirection: "row", alignItems: "center" }}>
                            <Checkbox color={Color.light.onBackground} status={remember ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setRemember(!remember);
                                }} />
                            <Text>مرا به خاطر بسپار</Text>
                        </View>
                        {loading ? <Button disabled={loading} onTouchStart={onSubmit} style={{ borderRadius: 5 }} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" ><ActivityIndicator color={Colors.light.secondary} /></Button> :
                            <Button disabled={loading} onTouchStart={onSubmit} style={{ borderRadius: 5 }} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" >ادامه<AntDesign name="arrowleft" />
                            </Button>
                        }
                        {timer > 0 ?
                            <Text style={{ textAlign: "center", marginTop: 15 }}>
                                مانده تا دریافت مجدد کد  {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padEnd(2, "0")}
                            </Text> : null
                        }

                        <View style={{ display: "flex", flexDirection: "row", backgroundColor: "white", marginTop: 20 }}>
                            <Text style={{ color: "#b6b8bbff", fontWeight: "800", fontSize: 16 }}>آیا هنوز عضو نیستید؟</Text>
                            <TouchableOpacity onPress={() => router.push("/register")}>
                                <Text style={{ fontWeight: "800", fontSize: 16 }} >اکنون عضو شوید</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
            </View>
        </SafeAreaView>
    )
    
}