import { View,Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAssets } from "expo-asset"
import { Image } from "expo-image"
import { FontAwesome } from "@expo/vector-icons"

export default function Card({name,cardNumber,owner}:{name:string,cardNumber:string,owner:string}) {
    const [asset,error] = useAssets([require("../assets/images/card.png")])
    
    return(
        <View style={{padding:10,flex:1}}>
            <LinearGradient style={{padding:20,borderRadius:10}} start={{x:0,y:0.5}} end={{x:1,y:0.5}} dither={true} colors={["rgba(122, 0, 122, 1)",":rgba(160, 0, 160, 1)","rgb(1, 80, 183)"]}>
                <View style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                    <FontAwesome si name="plus"/>
                </View>
            </LinearGradient>
        </View>

    )
    
}