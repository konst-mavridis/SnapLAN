use uuid::Uuid;
use hostname;

mod discovery;

#[tokio::main]
async fn main() {
    let id = Uuid::new_v4().to_string();
    let name = hostname::get().unwrap().to_string_lossy().to_string();

    tracing::info!("SnapLAN starting ...");
    tracing::info!("Device: {} ({})", name, id);

    let id1 = id.clone();
    let name1 = name.clone();

    tokio::spawn(async move {
        discovery::advertiser::start(id1, name1).await;
    });

    tokio::spawn(async move {
        discovery::browser::start().await;
    });

    loop { 
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;   
    }
}