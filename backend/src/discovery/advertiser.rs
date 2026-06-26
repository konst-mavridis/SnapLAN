// Implement a simple UDP broadcaster that sends a JSON message to the local network every 5 seconds.
// Import UdpSocket from tokio,
use tokio::net::UdpSocket;
// Import serde for serialization
use serde::Serialize;
// Import std::time::Duration and tokio::time::sleep for timing
use std::time::Duration;
use tokio::time::sleep;

// Define a struct for the broadcast message
#[derive(Serialize)]
struct BroadcastMsg {
    id: String,
    name: String,
    port: u16,
}

// Start the UDP broadcaster
pub async fn start(id: String, name: String) {
    let socket = UdpSocket::bind("0.0.0.0:0").await.unwrap();
    socket.set_broadcast(true).unwrap();
    
    let msg = BroadcastMsg {
        id,
        name,
        port: 9000,
    };
    
    let json = serde_json::to_string(&msg).unwrap();

    loop {
        let _ = socket.send_to(json.as_bytes(), "255.255.255.255:8888").await;
        sleep(Duration::from_secs(2)).await;
    }
}