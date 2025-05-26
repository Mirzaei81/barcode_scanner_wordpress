import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import WebView, { WebViewNavigation } from "react-native-webview";

export default function App() {
    
    const {url} = useLocalSearchParams<{url:string}>()
    const webViewRef = useRef(null)
    const onNavigationStateChange = (d:WebViewNavigation)=>{
        console.log(d.url,d)
        if(d.url=="https://zardaan.com/checkout/order-received/83853/?key=wc_order_L05EQVaQ0OlN1&wc_status=success"){
            
            router.push("/")
        }
    }
    return (
        <WebView
            ref={webViewRef.current}
            source={{ uri: url??"zardaan.com" }}
            onNavigationStateChange={(d)=>onNavigationStateChange(d)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            style={{flex:1}}
     />
    )
    
}