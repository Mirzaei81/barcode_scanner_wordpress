import { Products } from "./types"
export async function getProductBySKU(Sku:string):Promise<Products> {
    const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?sku=${Sku}`, {
        signal:AbortSignal.timeout(10000),
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
        }
      })
    return await response.json()
}

export async function getProductByName(name:string):Promise<Products> {
    const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?name=${name}`, {
        signal:AbortSignal.timeout(10000),
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
        }
      })
    console.log(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?name=${name}`)
    return await response.json()
}

export async function postOrder(){
  const res = await fetch('https://example.com/wp-json/wc/v3/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
    },
    body: JSON.stringify({
      'payment_method': 'bacs',
      'payment_method_title': 'Direct Bank Transfer',
      'set_paid': true,
      'billing': {
        'first_name': 'John',
        'last_name': 'Doe',
        'address_1': '969 Market',
        'address_2': '',
        'city': 'San Francisco',
        'state': 'CA',
        'postcode': '94103',
        'country': 'US',
        'email': 'john.doe@example.com',
        'phone': '(555) 555-5555'
      },
      'shipping': {
        'first_name': 'John',
        'last_name': 'Doe',
        'address_1': '969 Market',
        'address_2': '',
        'city': 'San Francisco',
        'state': 'CA',
        'postcode': '94103',
        'country': 'US'
      },
      'line_items': [
        {
          'product_id': 93,
          'quantity': 2
        },
        {
          'product_id': 22,
          'variation_id': 23,
          'quantity': 1
        }
      ],
      'shipping_lines': [
        {
          'method_id': 'flat_rate',
          'method_title': 'Flat Rate',
          'total': '10.00'
        }
      ]
    })
  });
  return res.status
}

export async function register(name:string,Phone:string,country:string){
  const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/digits/v1/register_user`, {
    "method": "POST",
    "headers": {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    "body":JSON.stringify({"user":Phone,"countryCode":country,"otp":name})
  })
  return await response.json()
}
export async function login(Phone:string,country:string,otp:string){
  const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/digits/v1/login_user`, {
    "method": "POST",
    "headers": {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    "body":JSON.stringify({"user":Phone,"countryCode":country,"otp":otp})
  })
}
export async function sendOtp(Phone:string,country:string){
  const response = await fetch(`https://zardaan.com/wp-json/digits/v1/send_otp`, {
    method: 'POST',
    headers:{'content-type': 'application/json'},
    body: JSON.stringify({"countrycode":country,"mobileNo":Phone,"type":"login"})
  });
  console.log(response.status,`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/digits/v1/send_otp`)
 
  return response.json()
}
export async function getCheckoutToken(resNum:number,Amount:number,phoneNumber:string){
  const response =await fetch("https://sep.shaparak.ir/onlinepg/onlinepg", { method: "POST", headers: { "Content-Type": "application/json" },body:JSON.stringify(`{
"action":"token",
"TerminalId":${process.env.EXPO_PUBLIC_TERMINAL_CODE},
"Amount":${Amount},
"ResNum":${resNum},
"RedirectUrl":"http://mysite.com/receipt",
"CellNumber":${phoneNumber}
}`) })
const token = await response.json()
if(token.status==1){
  return `https://sep.shaparak.ir/OnlinePG/SendToken?token=${token.token}`  
}
throw Error(`${token.errorCode}\r\n\r\n${token.errorDesc}`)
}

