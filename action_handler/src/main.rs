use home::home_dir;

use async_std::stream::StreamExt;
use instance::list::List;
use manifest::get_version_manifest;
use serde_json;
use serde_json::Value;
use tide::Request;
use tide::prelude::*;
use surf;

pub mod instance;
use instance::Instance;

pub mod java;
use java::Java;

pub mod root;
use root::LauncherRoot;

use tide_websockets::Message;
use tide_websockets::WebSocket;
use tide_websockets::WebSocketConnection;

mod threadpool;

mod types;
mod utils;
mod messsages;
mod manifest;


#[derive(Debug, Deserialize)]
struct Animal {
    name: String,
    legs: u16,
}

#[async_std::main]
async fn main() -> tide::Result<()> {
    let mut app = tide::new();

    // Example Data
    app.at("/orders/shoes").post(order_shoes);

    // Init routes
    app.at("/init/root").post(handle_init_root);

    // Java routes
    app.at("/ws/java/install").get(WebSocket::new(|_req, ws| download_java_ws(ws)));

    // Instance routes
    app.at("/instance/download_versions").get(get_versions);
    app.at("/ws/instance/get_version").get(WebSocket::new(|_req, ws| get_version_ws(ws)));

    // app.at("/instance/create").post(create_instance);
    app.at("/ws/instance/init").get(WebSocket::new(|_req, ws| init_instance_ws(ws)));
    app.at("/ws/instance/run").get(WebSocket::new(|_req, ws| run_instance_ws(ws)));
    app.at("/ws/instance/list").get(WebSocket::new(|_req, ws| list_instances_ws(ws)));

    app.at("/debug/ws").get(WebSocket::new(|_req, stream| debug_ws(stream)));

    // Run server
    app.listen("127.0.0.1:8080").await?;

    Ok(())
}



#[derive(Debug, Deserialize)]
struct DownloadRequest {
    java_ver: String,
}

async fn download_java_ws(mut ws: WebSocketConnection) -> tide::Result<()> {
    while let Some(Ok(Message::Text(input))) = ws.next().await {
        let download_request: DownloadRequest = serde_json::from_str(&input).map_err(|e| {
            tide::Error::from_str(400, format!("Failed to parse recieved JSON: {}", e))
        })?;

        let DownloadRequest { java_ver } = download_request;
        // let available_java_url = "https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json";

        match home_dir() {
            Some(path) => {
                let java_path = format!("{}/.sonata/java", path.display());
                let metacache_path = format!("{}/.sonata/metacache.json", path.display());
                let java_properties = Java::new("21".to_string(), "java-runtime-delta".to_string(), java_path);
                Java::init(java_properties, metacache_path).await.unwrap();
            },
            None => (),
        };

        println!("Recieved java version: {}", java_ver);
    }

    Ok(())
}


async fn init_instance_ws(mut ws: WebSocketConnection) -> tide::Result<()> {
    while let Some(Ok(Message::Text(input))) = ws.next().await {
        let mut instance_request: Instance = serde_json::from_str(&input).map_err(|e| {
            println!("Failed to parse JSON");
            tide::Error::from_str(400, format!("Failed to parse recieved JSON: {}", e))
        })?;

        let response: serde_json::Value;
        match Instance::init_or_run(&mut instance_request, &ws).await {
            Ok(result) => {
                response = json!(result)
            },

            Err(e) => {
                println!("{e}");
                response = json!({
                    "result": format!("Failed"),
                    "error": format!("Failed to create instance, {}", e)
                });
            }
        }

        ws.send_string(format!("{response}")).await?;
    }

    Ok(())
}


#[derive(Deserialize, Debug)]
struct RunRequest {
    name: String,
    url: String
}

async fn run_instance_ws(mut ws: WebSocketConnection) -> tide::Result<()> {
    while let Some(Ok(Message::Text(input))) = ws.next().await {
        let RunRequest {name, url} = serde_json::from_str(&input).map_err(|e| {
            println!("Failed to parse JSON");
            tide::Error::from_str(400, format!("Failed to parse recieved JSON: {}", e))
        })?;

        let response: serde_json::Value;
        let mut instance_request = Instance::new(name, url, None);
        match Instance::init_or_run(&mut instance_request, &ws).await {
            Ok(result) => {
                response = json!(result)
            },

            Err(e) => {
                println!("{e}");
                response = json!({
                    "result": format!("Failed"),
                    "error": format!("Failed to create instance, {}", e)
                });
            }
        }

        ws.send_string(format!("{response}")).await?;
    }

    Ok(())
}


async fn list_instances_ws(mut ws: WebSocketConnection) -> tide::Result<()> {
    while let Some(Ok(Message::Text(_input))) = ws.next().await {
        let list_struct = List::new("/Users/quartix/.sonata/headers/main.json".to_string());

        let _result;
        match List::start_paths_checking(&list_struct, &ws).await {
            Ok(_) => {
                _result = json!({
                    "message": "Scan Completed"
                })
            },
            Err(e) => {
                _result = json!({
                    "message": e
                })
            }
        };

        // ws.send_string(format!("{result}")).await?;
    }

    Ok(())
}


async fn debug_ws(mut stream: WebSocketConnection) -> tide::Result<()> {
    while let Some(Ok(Message::Text(input))) = stream.next().await {
        let output: String = input.chars().rev().collect();

        for _ in 0..10 {
            stream
                .send_string(format!("{} | {}", &input, &output)).await?;
        }
    }

    Ok(())
}


async fn order_shoes(mut req: Request<()>) -> tide::Result {
    let Animal { name, legs } = req.body_json().await?;
    let response_body = json!({
        "message": format!("Hello, {}! I've put in an order for {} shoes", name, legs)
    });

    Ok(tide::Response::builder(200)
        .body(response_body)
        .content_type(tide::http::mime::JSON)
        .build())
}


async fn handle_init_root(mut req: Request<()>) -> tide::Result {
    let launcher_root: LauncherRoot = req.body_json().await?;

    let response = json!({ "message": launcher_root.init_root() });

    Ok(tide::Response::builder(200)
        .body(response)
        .content_type(tide::http::mime::JSON)
        .build())
}


async fn get_versions(_req: Request<()>) -> tide::Result {
    let url = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

    let result;
    let code;

    match surf::get(url).await {
        Ok(mut response) => {
            match response.body_json::<serde_json::Value>().await {
                Ok(data) => {
                    result = data;
                    code = 200;
                },
                Err(_) => {
                        result = json!({ "message": "Failed to parse JSON" });
                        code = 500;
                }
            }
        },

        Err(_) => {
                result = json!({ "message": "Failed to download versions manifest" });
                code = 500;
        }
    }

    Ok(tide::Response::builder(code)
        .body(result)
        .content_type(tide::http::mime::JSON)
        .build())
}


#[derive(Debug, Deserialize)]
struct Version<'a> {
    id: &'a str
}

async fn get_version_ws(mut ws: WebSocketConnection) -> tide::Result<()> {
    #[derive(Debug, Serialize)]
    struct Result {
        status: String,
        target: Value
    }

    while let Some(Ok(Message::Text(input))) = ws.next().await {
        let version_request: Version = serde_json::from_str(&input).map_err(|e| {
            tide::Error::from_str(400, format!("Failed to parse recieved JSON: {}", e))
        })?;

        let result = match get_version_manifest(version_request.id).await {
            Ok(data) => {
                json!(Result {
                    status: "done".to_string(),
                    target: data
                })
            },
            Err(e) => json!({
                "error": e
            })
        };

        println!("{}", result);
        ws.send_json(&result).await?;
    }

    Ok(())
}


// async fn create_instance(mut req: Request<()>) -> tide::Result {
//     let InstanceRequest { name, url, info } = req.body_json().await?;

//     for (k, v) in info.iter() {
//         println!("k: {}, v: {}", k, v);
//     }

//     let response: serde_json::Value;
//     match Instance::init(&mut Instance::new(name, url, info)).await {
//         Ok(result) => {
//             response = json!({
//                 "result": format!("Created, {}", result)
//             });

//         },

//         Err(e) => {
//             response = json!({
//                 "result": format!("Failed to create instance, {}", e)
//             });
//         }
//     }

//     Ok(tide::Response::builder(200)
//         .body(response)
//         .content_type(tide::http::mime::JSON)
//         .build())
// }
