import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { deleteItemAsync, getItemAsync,setItemAsync } from "expo-secure-store"
import { useEffect, useState } from "react"
import { BackHandler, TouchableOpacity, View,StyleSheet,Text,ScrollView} from "react-native"
import {  SafeAreaView } from "react-native-safe-area-context"
import { colorMain, colorSecondary } from "./[id]"
import { useAssets } from "expo-asset"
import {Image } from 'expo-image'
import { router } from "expo-router"
import Card from "@/components/card"
import * as Sqlite from "expo-sqlite"
import { ActivityIndicator, Button, Checkbox, Portal, RadioButton, TextInput, Modal } from "react-native-paper"
import { Dropdown,Option } from 'react-native-paper-dropdown';
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks"
import { postOrder, productItem } from "./utils"
import Qr from "../assets/images/qr_blue.svg"

const transferMethods = {
    post:"ارسال با پیک به تهران",
    tipax:"ارسال با تیپاکس به شهرستان",
    onsite:"نحویل درب فروشگاه"

}
const paymentMethods= {
    parsian:"درگاه پرداخت بانک پارسیان",
    cardTransfer:"کارت به کارت",
    pos:"پوز فروشگاه"
}

interface card{
    id:number
    name:string
    number:string
    owner:string
    created_at:string
}
interface province {
    name: string
    center: string
    latitude: string
    longitude: string
    id: number
}
export default function App(){
    const [checkout,setCheckout] = useState({name:"",familyName:"",phoneNumber:"",province:"",city:"",postAddress:"",postCode:"",paymentMethod:paymentMethods.parsian,transfer:transferMethods.post})
    const [cards,setCards] = useState<card[]>([])
    const [assets, _] = useAssets([require("../assets/images/Title.png"),])
    const [provinces,setProvinces] = useState<Option[]>([])
    const [states,setStates] = useState<Option[]>([])
    const [subscribe,setSubscribe] = useState(false)
    const [eula,setEulo] = useState(false)
    const [loading,setLoading] = useState(false)
    const {cost} = useLocalSearchParams()
    const [visible,setVisible] = useState(false)
    
    useEffect(()=>{
        (async()=>{
            const name =await getItemAsync("name")??''
            const familyName = await getItemAsync("lastName")??""
            const phoneNumber = await getItemAsync("phone")??""
            const province = await getItemAsync("province")??""
            const city = await getItemAsync("city")??""
            const postAddress = await getItemAsync("postAddress")??""
            const postCode = await getItemAsync("postCode")??""
            const paymentMethod = await getItemAsync("paymentMethod")??paymentMethods.parsian
            const transfer = await getItemAsync("transferMethod")??transferMethods.post
            setCheckout({ name:name, familyName:familyName, phoneNumber:phoneNumber, province:province, city:city, postAddress:postAddress,postCode:postCode, paymentMethod:paymentMethod, transfer:transfer })

            if(city!=""){
                setProvince({ name:name, familyName:familyName, phoneNumber:phoneNumber, province:province, city:city, postAddress:postAddress,postCode:postCode, paymentMethod:paymentMethod, transfer:transfer },city)
            }
            const db = await Sqlite.openDatabaseAsync('Products.db');
            const storeCards:card[]=  await db.getAllAsync("SELECT * from cards;")
            setCards([...storeCards])
            const res = await fetch("https://iran-locations-api.ir/api/v1/fa/states")
            console.log(res)
            const provs:province[] = await res.json()
            const opts:Option[] = provs.map<Option>((p)=>({label:p.name,value:p.name}))
            setProvinces(opts)
        })()
    },[])
    const setProvince = async (checkout:any,p: string) => {
        setCheckout({ ...checkout,province:p })
        try{
            const res = await fetch(`https://iran-locations-api.ir/api/v1/fa/cities?state=${p}`)
            const states = await res.json()
            console.log(states)
            //@ts-ignore
            const opts = states[0]["cities"].map<Option>((i) => ({ label: i.name, value: i.name }))
            setStates(opts)
        }catch(e){
            console.log(e)
        }
    }
    async function delParams() {
        await deleteItemAsync("name")
        await deleteItemAsync("lastName")
        await deleteItemAsync("phone")
        await deleteItemAsync("province")
        await deleteItemAsync("city")
        await deleteItemAsync("postAddress")
        await deleteItemAsync("postCode")
        await deleteItemAsync("paymentMethod")
        await deleteItemAsync("transferMethod")
    }
    async function processCheckout(){
        setLoading(true)
        const db = await Sqlite.openDatabaseAsync('Products.db');
        const products:productItem[] = await db.getAllAsync("select product_id,count as quantity from cart ")
        await setItemAsync("name", checkout.name)
         await setItemAsync("lastName",checkout.familyName)
         await setItemAsync("phone",checkout.phoneNumber)
         await setItemAsync("province",checkout.province)
         await setItemAsync("city",checkout.city)
         await setItemAsync("postAddress",checkout.postAddress)
         await setItemAsync("postCode",checkout.postCode)
         await setItemAsync("paymentMethod",checkout.paymentMethod)
         await setItemAsync("eula",subscribe+"")
         await setItemAsync("subsribe",eula+"")
        let uri;
        if(checkout.paymentMethod=="parsian"){
            uri = await postOrder("pec_gateway","درگاه بانک پارسیان برای ووکامرس",checkout.name,checkout.familyName,checkout.city,checkout.province,checkout.postAddress,checkout.phoneNumber,products)

        }
        else if(checkout.paymentMethod=="cardTransfer"){
            uri = await postOrder("bacs", "انتقال مستقیم بانکی",checkout.name,checkout.familyName,checkout.city,checkout.province,checkout.postAddress,checkout.phoneNumber,products)

        }
        else{
            console.log(checkout.paymentMethod)
        }
        setLoading(false)
        router.push({pathname:"/payment",params:{url:uri?.uri}})
    }

    return(
        <SafeAreaView>
            <Portal>
                    {loading ?
                    <View style={[styles.activity]}>
                        <View style={{backgroundColor:"white",padding:34,borderRadius:36,borderWidth:1,alignSelf:"center",borderColor:colorSecondary}}>
                            <ActivityIndicator  color={colorMain} size={64} />
                            <Text>در حال پردازش</Text>
                        </View>

                    </View>
                    :null }
                    <Modal  visible={visible} onDismiss={() => setVisible(false)} style={{ direction:"rtl" }} contentContainerStyle={{backgroundColor:"white",borderRadius:10,padding:5,marginHorizontal:20}}>
                        <Text style={{fontSize:18}}>ایا مطمئنید میخواهید ادرس مربوطه را پاک کنید </Text>
                        <View style={{ marginTop:20,display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                            <Button style={{marginLeft:5}} onPress={() => setVisible(false)} mode="contained" buttonColor="#ff0000ff">خیر</Button>
                            <Button onPress={delParams} mode="contained" buttonColor="#31af34ff">بله</Button>
                        </View>
                    </Modal>
            </Portal>
                  
            <View style={{height:"100%",flexDirection:"column",backgroundColor:colorMain}}>
                <View style={styles.header}>
                    {cards.length > 0 ? <Card name={cards[0].name} cardNumber={cards[0].number} owner={cards[0].owner} /> : assets ? <Image source={assets[0]} style={{ width: 220, height: 80 }} /> : <></>}
                    <View style={{ display: "flex", flexDirection: "column" }}>
                        <FontAwesome onPress={() => router.replace("/")} style={{ paddingHorizontal: 20 }} color={colorSecondary} name="home" size={72} />
                        <Text style={{ fontSize: 36, color: colorSecondary }}>پرداخت</Text>
                    </View>
                    <TouchableOpacity onPressIn={() => BackHandler.exitApp()} style={styles.exit}>
                        <MaterialCommunityIcons color="#ffffffff" name="location-exit" size={48} />
                    </TouchableOpacity>
                </View>

                <View style={styles.main}>
                    <ScrollView>
                        <TouchableOpacity onPress={()=>setVisible(true)} style={{ display: "flex", direction: "rtl", alignSelf:"flex-end"}}>
                            <Text style={{textAlign:"right", padding: 5, width: "100%", borderWidth: 1, fontSize: 22, color: "#008000ff", borderColor: "#008000ff", borderRadius: 10 }}>آدرس جدید</Text>
                        </TouchableOpacity>
                        <View style={{ marginTop:20,direction: "rtl", display: "flex", flexDirection: "row",justifyContent: "space-between" }}>
                            <View style={{ width: "40%",marginLeft:10 }}>
                                <Text style={{fontSize:18}}>نام</Text>
                                <TextInput  value={checkout.name} onChangeText={(e)=>setCheckout({...checkout,name:e})} theme={{roundness:10}} textColor="black" style={{ textAlign:"right",backgroundColor:"white",height:40,color:"black"}} mode="outlined" />
                            </View>
                            <View style={{ width: "55%" }}>
                                <Text style={{fontSize:18}}>نام خانوادگی</Text>
                                <TextInput value={checkout.familyName} onChangeText={(e)=>setCheckout({...checkout,familyName:e})}theme={{roundness:10}} textColor="black" style={{ textAlign:"right",backgroundColor:"white",height:40,color:"black"}} mode="outlined" />
                            </View>
                        </View>
                        <View style={{ direction: "rtl", display: "flex", flexDirection: "row",justifyContent:"space-between"}}>
                            <View style={{ width: "45%",marginRight:10 }}>
                                <Text style={{ fontSize: 18 }}>شماره تماس</Text>
                                <TextInput value={checkout.phoneNumber} textColor="black" keyboardType="numeric" onChangeText={(e)=>setCheckout({...checkout,phoneNumber:e})} theme={{ roundness: 10 }} style={{ backgroundColor: "white",height:40 }} mode="outlined" />
                            </View>
                            <View style={{ width: "45%" }}>
                                <Text style={{ fontSize: 18 }}>کد پستی</Text>
                                <TextInput value={checkout.postCode} textColor="black" keyboardType="numeric" onChangeText={(e)=>setCheckout({...checkout,postCode:e})} theme={{ roundness: 10 }} style={{ backgroundColor: "white",height:40 }} mode="outlined" />
                            </View>
                        </View>
                        <View style={{display:"flex",flexDirection:"row",marginTop:25,justifyContent:"center"}}>
                            <View style={{ width: "45%",marginRight:10 }}>
                                <Dropdown hideMenuHeader   value={checkout.city}  disabled={states.length == 0} mode="outlined" placeholder="شهر" options={states} onSelect={(d) =>setCheckout({...checkout,city:d??""}) } />
                            </View>
                            <View style={{ width: "45%" }}>
                                <Dropdown hideMenuHeader  value={checkout.province} disabled={provinces.length==0} mode="outlined" placeholder="استان" options={provinces} onSelect={(d) => setProvince(checkout,d ?? "")} />
                            </View>
                        </View>
                        <View style={{ direction: "rtl", display: "flex", flexDirection: "row",marginBottom:4}}>
                            <View style={{ width: "100%", marginLeft: 10 }}>
                                <Text style={{ fontSize: 18 }}>ادرس پستی</Text>
                                <TextInput  value={checkout.postAddress} textColor="black" contentStyle={{direction:"ltr"}} onChangeText={(e)=>setCheckout({...checkout,postAddress:e})} theme={{ roundness: 10 }} style={{ backgroundColor: "white",height:40,direction:"rtl",textAlign:"right" }} mode="outlined" />
                            </View>
                        </View>
                        <View style={{display:"flex",flexDirection:"row",justifyContent:"space-around"}}>
                            <View>
                                <Text style={{textAlign:"center",fontSize:18,fontWeight:"bold"}}>روش پرداخت</Text>
                                {Object.keys(paymentMethods).map((p,i)=>(
                                    <View key={i} style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center" }}>
                                        <RadioButton color={colorSecondary} value={p} status={checkout.paymentMethod == p ? "checked" : "unchecked"} onPress={() => setCheckout({ ...checkout, paymentMethod: p })} />
                                        <Text>{paymentMethods[p]}</Text>
                                    </View>
                                )
                                )}
                            </View>
                            <View>
                                <Text style={{textAlign:"center",fontSize:18,fontWeight:"bold"}}>حمل و نقل</Text>
                                {Object.keys(transferMethods).map((p,i)=>(
                                    <View key={i} style={{display:"flex",flexDirection:"row-reverse",alignItems:"center"}}>
                                        <RadioButton color={colorSecondary} value={p} status={checkout.transfer == p ? "checked" : "unchecked"} onPress={() => setCheckout({ ...checkout, transfer: p })} />
                                        <Text>{transferMethods[p]}</Text>
                                    </View>
                                )
                                )}
                            </View>
                        </View>
                        <View style={{display:"flex",flexDirection:"row",alignItems:"center",direction:"rtl"}}>
                            <Checkbox color={colorSecondary} status={subscribe ? "checked" : "unchecked"} onPress={()=>setSubscribe(!subscribe)} />
                            <Text>عضویت در سایت زردان</Text>
                        </View>

                        <View style={{display:"flex",flexDirection:"row",alignItems:"center",direction:"rtl"}}>
                            <Checkbox color={colorSecondary} status={eula ? "checked" : "unchecked"} onPress={()=>setEulo(!eula)} />
                            <Text style={{color:"red"}}>من قوانین و ضوابط را خوانده ام و ان را میپذیرم</Text>
                        </View>
                        <View style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"row",direction:"rtl"}}><Text>مجموع</Text><Text style={{borderWidth:1,margin:10,paddingHorizontal:25,borderRadius:5}}>{parseInt(cost!).toLocaleString("en-us")} تومان  </Text></View>
                        <Button  onTouchStart={()=>processCheckout()} theme={{roundness:2}}  style={{width:"30%",alignSelf:"center"}}  buttonColor="#407120ff" textColor="white"> پرداخت</Button>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    main: {
        flex:1,
        backgroundColor:"white",
        margin:10,
        borderRadius:10,
        marginVertical: 5,
        padding:10
    },
    header: {
        justifyContent:"space-around",
        alignItems:"center",
        backgroundColor: colorMain,
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
  activity:{
    flex:1,
    justifyContent:"center",
    alignContent:"center"
  }
})