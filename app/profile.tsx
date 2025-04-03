import { View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Button, Text } from "react-native-paper"
import Color from "../constants/Colors"
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput } from "react-native";
import { getItemAsync, setItemAsync,deleteItemAsync } from "expo-secure-store";
import {  FontAwesome } from "@expo/vector-icons";
import Cart from "../assets/images/cart.svg"
import { useAssets } from "expo-asset";
import { Image } from "expo-image";
import Avatar from "../assets/images/avatar.svg";
import { router } from "expo-router";
import Colors from "../constants/Colors";
import { updateUser } from "./utils";
import { Customer } from "./types";
import LottieView from 'lottie-react-native';

export default function App() {
    const [name, setName] = useState('')
    const [lastName, setlastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState<string>("")
    const [edit,setEdit] = useState({name:true,email:true,phone:true,lastName:true})
    const [loading, setLoading] = useState(false)
    const animationRef = useRef<LottieView>(null);
    const [assets, error] = useAssets([

        require("../assets/images/logoSecondary.png"),
    ])
    const onSubmit = async() => {
        animationRef.current?.play()
        const updatedUser:Customer = await updateUser((await getItemAsync("id"))??"",name,lastName,email,phone)
        const currentPhone = await getItemAsync("phone")
        console.log(updatedUser)
        if(phone==currentPhone){
            await deleteItemAsync("phone")
            router.push("/login")
            return;
        } 
        await setItemAsync("email",updatedUser.email)
        await setItemAsync("name",updatedUser.first_name)
        await setItemAsync("lastName",updatedUser.last_name)
        
    };
    useEffect(()=>{
        (async()=>{
            const name = await  getItemAsync("name")
            if(name == null || name.length ==0){
                router.push("/login")
                return
            }
            setName(name)
            setEmail(await getItemAsync("email")??"")
            setPhone(await getItemAsync("phone")??"")
        })()
    },[])
    return (
        <SafeAreaView>
            <View style={{ height: "100%", backgroundColor: Color.light.background }}>
                <View style={{ marginTop: 10, display: "flex", flexDirection: "row", justifyContent: "space-around", backgroundColor: Color.light.background }}>
                    {(assets && assets.length != 0) ? <Image contentFit="contain" source={assets![0]} style={{ width: 174, height: 80 }} /> : <></>}
                    <View onTouchStart={() => router.push("/")} style={{ backgroundColor: Color.light.secondary, justifyContent: "center", alignContent: "center", borderRadius: 20 }}>
                        <FontAwesome style={{ paddingHorizontal: 20 }} color="white" name="home" size={36} />
                    </View>
                </View>
                <View style={{ flex: 1,flexDirection:"column",justifyContent:"space-between", backgroundColor: "white", margin: 20, direction: "rtl", padding: 10 }}>
                    <View style={{backgroundColor:"white"}}>
                    <View style={{ marginVertical: 20, display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row", backgroundColor: "white" }}>
                        <Avatar width={150} height={150} />
                        <Text style={{ color: "#008000ff", fontSize: 64 }}>کاربری</Text>
                    </View>
                    <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "black" }}>نام </Text>
                    </View>
                    <View style={{ direction: "ltr", backgroundColor:edit.name?"#c1c1c1":"white",display:"flex",flexDirection:"row",borderWidth:1,borderRadius:5,borderColor:"grey" }}>
                        <TextInput
                            style={[{ height: 45,flex:1,borderColor:"grey" }]}
                            placeholder={"1234"}
                            placeholderTextColor={'#dddddd'}
                            readOnly={edit.name}
                            onChangeText={(s)=>{setName(s)}}
                            value={name}
                            />
                        <FontAwesome onPress={()=> setEdit({...edit,name:!edit.name})} style={{display:"flex",alignSelf:"center"}} size={32} name="edit" />
                    </View>
                    <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "black" }}> نام خانوادگی</Text>
                    </View>
                    <View style={{ direction: "ltr", backgroundColor:edit.name?"#c1c1c1":"white",display:"flex",flexDirection:"row",borderWidth:1,borderRadius:5,borderColor:"grey" }}>
                        <TextInput
                            style={[{ height: 45,flex:1,borderColor:"grey" }]}
                            placeholder={"1234"}
                            placeholderTextColor={'#dddddd'}
                            readOnly={edit.lastName}
                            onChangeText={(s)=>{setlastName(s)}}
                            value={name}
                            />
                        <FontAwesome onPress={()=> setEdit({...edit,name:!edit.lastName})} style={{display:"flex",alignSelf:"center"}} size={32} name="edit" />
                    </View>
                    <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "black" }}>شماره همراه</Text>
                    </View>
                    <View style={{ direction: "ltr", backgroundColor:edit.phone?"#c1c1c1":"white",display:"flex",flexDirection:"row",borderWidth:1,borderRadius:5,borderColor:"grey" }}>
                        <TextInput
                            style={[{ height: 45,flex:1,borderColor:"grey" }]}
                            placeholder={"91000000000"}
                            keyboardType='number-pad'
                            placeholderTextColor={'#dddddd'}
                            readOnly={edit.phone}
                            onChangeText={(s)=>{setPhone(s)}}
                            value={phone}
                         />                        
                        <FontAwesome onPress={()=>setEdit({...edit,phone:!edit.phone})} style={{display:"flex",alignSelf:"center"}} size={32} name="edit" />
                    </View>
                    <View style={{ backgroundColor: "white", alignSelf: 'flex-start', borderBottomColor: 'black', paddingBottom: 5, borderBottomWidth: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "black" }}>ایمیل</Text>
                    </View>
                    <View style={{ direction: "ltr", backgroundColor:edit.email?"#c1c1c1":"white",display:"flex",flexDirection:"row",borderWidth:1,borderRadius:5,borderColor:"grey" }}>
                        <TextInput
                            style={[{ height: 45,flex:1 }]}
                            placeholder={"email@example.com"}
                            readOnly={edit.email}
                            onChangeText={(s)=>{setEmail(s)}}
                            value={email}
                        />                         
                        <FontAwesome onPress={()=>setEdit({...edit,email:!edit.email})} style={{display:"flex",alignSelf:"center"}} size={32} name="edit" />
                    </View>
                    </View>
                    <View style={{ backgroundColor: "white", alignSelf: 'center'}}>
                        <Cart onPressIn={() => router.push("/cart")} width={64} height={64} />
                    </View>
                    <View >
                        {loading ? <Button contentStyle={{ alignSelf: "flex-end" }} disabled={loading} onTouchStart={onSubmit} style={{ borderRadius: 5 }} textColor="#fefdf4ff" buttonColor="#1c2434ff" mode="contained" ><ActivityIndicator color={Colors.light.secondary} /></Button> :
                            <Pressable   disabled={loading} onTouchStart={onSubmit} style={{ display:"flex",flexDirection:"row",backgroundColor:Colors.light.secondary,justifyContent:"space-between",alignItems:"center", borderRadius: 5 }} >
                                <Text style={{ color: "white",marginRight:10,fontSize:24 }}>تایید</Text>
                                <LottieView 
                                    source={require("../assets/animation/success_primary.json")}
                                    ref={animationRef}
                                    style={{ width: 60, height: 60 }}
                                    progress={0.7}
                                    autoPlay={false}
                                    loop={false}
                                />
                            </Pressable>
                        }
                    </View>
                </View>
            </View>
        </SafeAreaView>

    )
}