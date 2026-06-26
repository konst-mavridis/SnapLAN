use tokio::net::UdpSocket;
use serde::Deserialize;
use std::collections::HashSet;

#[derive(Deserialize, Debug, Clone)]
struct BroadcastMsg {
    id: String,
    name: String,
    port: u16,
}

pub async fn start() {
    let socket = UdpSocket::bind("0.0.0.0:8888").await.unwrap();

    let mut buf = [0u8; 1024];
    let mut seen: HashSet<String> = HashSet::new();

    loop {
        let (len, _) = socket.recv_from(&mut buf).await.unwrap();

        if let Ok(msg) = serde_json::from_slice::<BroadcastMsg>(&buf[..len]) {
            if !seen.contains(&msg.id) {
                println!("🟢 New device found: {} ({})", msg.name, msg.id);
                seen.insert(msg.id);
            }
        }
    }
}