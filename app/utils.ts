import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { Customer, Product, Products, uri } from "./types"
import OpenAI from 'react-native-openai';

export async function genrateProduct(output: string): Promise<Products | undefined> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // body: '{\n  "contents": [{\n    "parts":[{"text": "Explain how AI works"}]\n    }]\n   }',
    body: JSON.stringify({
      "system_instruction": {
        "parts": [
          {
            "text": `You are a product serilizer you job is to convert the given input into this json form only return the json and no other charecter json must be valid
            categories are in this format 
          {attrbute: string|null,brand: string,stock: number,dimentions: string,id: number,sku: number,link: string,name: string,price: number,description:string ,short_desc: string,weight: number}`
          }
        ]
      },
      'contents': [
        {

          'parts': [
            {
              'text': output
            }
          ]
        }
      ]
    })
  });
  const prod:Product =await response.json()
}
export async function create_product(productName:String,productType:String,productPrice:String,productDescription:String,productShortDescription:String,productCategories:String,productImages:String){
  const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
    },
    body: JSON.stringify({
      'name': productName,
      'type': productType,
      'regular_price': productPrice,
      'description': productDescription,
      'short_description': productShortDescription,
      'categories': [
        productCategories
      ],
      'images': [
        productImages
      ]
    })
  });
  return response.json()
}
export async function getProductIKEA(sku:Number):Promise<Products|undefined> {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Basic  "+ btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`))
  const raw = JSON.stringify({
    "searchParameters": {
      "input":sku,
      "type": "QUERY"
    },
    "components": [
      {
        "component": "PRIMARY_AREA"
      }
    ]
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch("https://sik.search.blue.cdtapps.com/ae/en/search", requestOptions)
  return genrateProduct(await response.text())
}
export async function getProductBySKU(Sku: string): Promise<Products|boolean|undefined> {
  let controller = new AbortController()
  console.log(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?sku=${Sku}`)
  setTimeout(() => controller.abort(), 10000);
  const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?sku=${Sku}`, {
    signal: controller.signal,
    headers: {
      'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
    }
  })
  let body = await response.text()
  try{
    const product:Products = JSON.parse(body)
    if(product.length==0){
      return true
    }
    return product
  }catch (e){
      console.log(body,e)
      return
  }
  
}

export async function getProductByName(name:string):Promise<Products> {
    let controller = new AbortController()
    setTimeout(() => controller.abort(), 10000); 
    const response = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/products?search=${name}`, {
        signal:controller.signal,
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
        }
      })
    return await response.json()
}
export interface productItem {
  product_id: number
  quantity: number
}
export async function postOrder(payment_method:string,payment_title:string,first_name:string,last_name:string,city :string,state:string,postcode :string,phone:string,products:productItem[]){
  let id = Number.parseInt(await getItemAsync("orderId",)||"-1")
  if (id==-1){
    const res = await fetch(`https://${process.env.EXPO_PUBLIC_WOOCOMERCE_HOST}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`)
      },
      body: JSON.stringify({
        'payment_method': payment_method,
        'payment_method_title': payment_title,
        'set_paid': false,
        'billing': {
          'first_name': first_name,
          'last_name': last_name,
          'address_1': '',
          'address_2': '',
          'city': city,
          'state': state,
          'postcode': postcode,
          'country': 'IR',
          'phone': phone
        },
        'shipping': {
          'first_name': first_name,
          'last_name': last_name,
          "company": "",
          'address_1': '',
          'address_2': '',
          'city': city,
          'state': state,
          'postcode': postcode,
          'country': 'IR'
        },
        'line_items': products,
        "shipping_lines": [
          {
            "method_title": "بسته بندی و ارسال تهران",
            "method_id": "advanced_shipping",
            "total_tax": "0",
            "tax_status": "taxable",
          }
        ],
        "status": "pending"
      })
    });
    const response = await res.json()
    await setItemAsync("orderId",response.id+"")
    id = response.id 
  }
  //@ts-ignore 
  return getPaymentUri(id)
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
export async function sendOtp(Phone:string){
  const response = await fetch(`https://zardaan.com/wp-json/phone/v1/send-otp/${Phone}`);
  return await response.json()
}

export async function verifyOtp(phone:string,otp:string):Promise<Customer>{
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", "pxcelPage_c01002=1");

  const raw = JSON.stringify({
    "otp": otp
  });


  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
};

  const response = await fetch(`https://zardaan.com/wp-json/phone/v1/verify-otp/${phone}`,requestOptions);
  console.log(`https://zardaan.com/wp-json/phone/v1/verify-otp/${phone}`,JSON.stringify({"otp":otp}))
  return await response.json()
}


export async function registerUser(phone:string,name:string){
  const response = await fetch(`https://zardaan.com/wp-json/phone/v1/register/${phone}`,{method:"POST",headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify({"name":name})});
  return await response.json()
}
export async function updateUser(id:string,first_name:string,last_name:string,email:string,phone:string){
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", 'Basic ' + btoa(`${process.env.EXPO_PUBLIC_WOOCOMERCE_KEY}:${process.env.EXPO_PUBLIC_WOOCOMERCE_SECRET}`));

  const raw = JSON.stringify({
    "first_name":first_name,
    "last_name":last_name,
    "username":first_name+last_name,
    "email":email,
    "billing": {
      "first_name": first_name,
      "last_name": last_name,
      "email":email,
      "phone": phone
    },
    "shipping": {
      "first_name": first_name,
      "last_name": last_name
    }
  });

  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  //@ts-ignore
  const response = await fetch(`https://example.com/wp-json/wc/v3/customers/${id}`, requestOptions)
  return response.json()
}

export async function getPaymentUri(orderId:string):Promise<uri>{
  const response = await fetch(`https://zardaan.com/wp-json/wc/v3/customers/pec/checkout1/${orderId}`);
  return response.json()
}

export async function directLogin(){
  await fetch('https://core.api.panel.direct/v3/user/login', {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.8',
      'authorization': 'Bearer',
      'content-type': 'application/json',
      'origin': 'https://app.panel.direct',
      'priority': 'u=1, i',
      'referer': 'https://app.panel.direct/',
      'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'sec-gpc': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
    },
    body: JSON.stringify({
      'phoneNumber': '00989121575307',
      'password': 'Ehsan1363'
    })
  });
 
}