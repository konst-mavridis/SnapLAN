use serde::{
    Serialize,
    Deserialize,
};
use super::{
    DeviceId,
    SessionId,
};
#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub enum PairMethod {
    QR,
    Ble,
    Manual,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct PairRequest {
    pub device_id: DeviceId,
    pub device_name: String,
    pub public_key: Vec<u8>,
    pub method: PairMethod,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct PairAccept {
    pub session_id: SessionId,
    pub public_key: Vec<u8>,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct PairReject {
    pub reason: String,
}