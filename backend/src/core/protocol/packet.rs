use serde::{
    Serialize,
    Deserialize,
};
use super::PacketHeader,

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct Packet<T> {
    pub header: PacketHeader,
    pub payload: T,
}
impl<T> Packet<T> {
    pub fn new(
        header: PacketHeader,
        payload: T,
    ) -> Self {
        Self {
            header,
            payload,
        }
    }
}