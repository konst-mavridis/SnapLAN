export function log(msg) {
    const el = document.getElementById("log");
    el.innerHTML += "<div>" + msg + "</div>";
    el.scrollTop = el.scrollHeight;
}

export function setStatus(s) {
    document.getElementById("status").innerText = "Status: " + s;
}
