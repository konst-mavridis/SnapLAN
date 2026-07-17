use serde::{
    Serialize,
    Deserialize,
};
use super::DeviceId;
use crate::core::identity::Capability;

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct DiscoverPacket {
    pub device_id: DeviceId,
    pub device_name: String,
    pub fingerprint: String,
    pub protocol_version: u16,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct DiscoverResponse {
    pub device_id: DeviceId,
    pub device_name: String,
    pub fingerprint: String,
    pub capabilities: HashSet<Capability>,
}