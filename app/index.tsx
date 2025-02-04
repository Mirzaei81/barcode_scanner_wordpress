import { View,Text } from "@/components/Themed";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { colorMain, colorSecondary } from "./[id]";
import { router } from "expo-router";
import {Image} from "expo-image"
import { useAssets } from "expo-asset";

export default function Index(){
    const [assets, error] = useAssets([require("../assets/images/Title.png")])
    return (
        <View style={styles.container}>
            {assets?<Image source={assets![0]} style={{ width: 194, height: 80 }} /> :<></>}
            <Button labelStyle={[styles.buttonLabel, { color: "black" }]} style={styles.button} onTouchStart={() => router.push("/main")}>اسکن</Button>
            <View style={styles.footer}>
                <Text style={[styles.text,{fontSize:18}]}>اپلیکیشن بارکدخوان فروشگاه زردان به سفارش زردان</Text>
                <Text style={styles.text}>طراحی توسط امیر عرشیا میرزایی</Text>
                <Text style={[styles.text,{color:colorSecondary}]}>کلیه حقوق این اپلیکیشن متعلق به فروشگاه زردان می باشد</Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    footer:{
        backgroundColor:colorMain,
        marginHorizontal:10
    },
    button: {
        backgroundColor: colorSecondary,
        width: 300,
        height: 110,
        justifyContent: "center",
        display: "flex",
        borderRadius: 100
    },
    text: {
        fontSize:22,
        textAlign:"center",
    },
    container:{
        flex:1,
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        direction:"rtl",
        backgroundColor:colorMain
    },
    buttonLabel: {
        fontSize: 42,
        padding:40,
        fontFamily: 'Lalezar',
        color: colorSecondary,
        verticalAlign:"middle"
    },
})