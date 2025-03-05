import { View } from "@/components/Themed";
import {  SafeAreaView } from "react-native-safe-area-context";
import {Text,Checkbox, Button, TextInput} from "react-native-paper"
import Color from "../constants/Colors"
import { useEffect, useState } from "react";
import { getItemAsync } from "expo-secure-store";
import { FontAwesome,AntDesign } from "@expo/vector-icons";
import { useAssets } from "expo-asset";
import {Image} from "expo-image"
import Avatar from "../assets/images/avatar.svg";
import { router } from "expo-router";
import CountryCodeDropdownPicker from 'react-native-dropdown-country-picker'
import { TouchableOpacity } from "react-native";
import { register } from "./utils";

export default function App(){
    const [phone, setPhone] = useState<string>("")
    const [selected, setSelected] = useState('+98')
    const [remember,setRemember] = useState(false)
    const [name,setName] = useState("")
    const [assets,error] = useAssets([
        require("../assets/images/logoSecondary.png"),
    ])
    useEffect(()=>{
        (async()=>{
            setPhone(await getItemAsync("phoneNumber")??"");
        })()
    },[])
    const onSubmit=async()=>{
        console.log(await register(name,phone,selected))
    }
    if(error){
        return(
            <View><Text>{error.message}</Text></View>
        )
    }
    return (
        <SafeAreaView>
            <View style={{height:"100%",backgroundColor: Color.light.background}}>
                <View style={{marginTop:10,display:"flex",flexDirection:"row",justifyContent:"space-around"}}>
                    {(assets &&assets.length!=0)?<Image contentFit="contain" source={assets![0]} style={{ width: 174, height: 80}} />:<></>}
                        <View onTouchStart={()=>router.push("/")} style={{backgroundColor: Color.light.secondary,justifyContent:"center",alignContent:"center",borderRadius:20}}>
                            <FontAwesome style={{paddingHorizontal:20}}  color="white" name="home" size={36} />
                        </View>
                </View>
                <View style={{flex:1,backgroundColor:"white",margin:20,direction:"rtl",padding:10}}>
                    <View style={{marginVertical:20,display:"flex",justifyContent:"space-around",alignItems:"center",flexDirection:"row",backgroundColor:"white"}}>
                        <Avatar width={150} height={150}/>
                        <Text style={{color:"#008000ff",fontSize:64}}>کاربری</Text>
                    </View>
                    <Text style={{fontSize:36,fontWeight:"800",marginBottom:20}}>عضویت</Text>
                        <View style={{backgroundColor:"white", alignSelf: 'flex-start', borderBottomColor: 'black',paddingBottom:3, borderBottomWidth: 3,marginBottom:8 }}>
                            <Text style={{ fontSize: 16, fontWeight: "800",  }}>نام</Text>
                        </View>
                        <TextInput contentStyle={{backgroundColor:"white",borderRadius:10,borderColor:"grey",borderWidth:1}} outlineStyle={{borderRadius:10,borderColor:"grey",borderWidth:10}}  mode="outlined"  onChangeText={(s)=>setName(s)}/>
                        <View style={{backgroundColor:"white", alignSelf: 'flex-start', borderBottomColor: 'black',paddingBottom:3, borderBottomWidth: 3,marginBottom:8 }}>
                            <Text style={{ fontSize: 16, fontWeight: "800",  }}>استفاده از موبایل</Text>
                        </View>
                    <View style={{ direction: "ltr",backgroundColor:"white"}}>
                        <CountryCodeDropdownPicker
                            selected={selected}
                            setSelected={setSelected}
                            phone={phone}
                            setPhone={setPhone}
                            phoneStyles={{height:45}}
                        />
                        </View>
                        <View style={{backgroundColor:"white",flexDirection:"row",alignItems:"center"}}>
                            <Checkbox color={Color.light.onBackground} status={remember ? 'checked' : 'unchecked'}
                                onPress={() => {
                                    setRemember(!remember);
                                }} />
                            <Text>مرا به خاطر بسپار</Text>
                        </View>
                        <Button onTouchStart={onSubmit} style={{borderRadius:5}} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" >ادامه<AntDesign name="arrowleft"/></Button>
                        <View style={{display:"flex",flexDirection:"row",backgroundColor:"white",marginTop:20}}>
                            <Text style={{color:"#b6b8bbff",fontWeight:"800",fontSize:16}}>قبلا عضو شدید؟</Text>
                            <TouchableOpacity onPress={()=>router.push("/profile")}>
                                <Text  style={{fontWeight:"800",fontSize:16}} >اکنون وارد شوید</Text>
                            </TouchableOpacity>
                        </View>
                </View>
            </View>

        </SafeAreaView>
    )
}