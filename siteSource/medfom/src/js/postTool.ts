export async function postTool(path: string, json: any) {
    return await new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open("POST", "http://" + window.location.hostname + path);
        req.send(JSON.stringify(json));
        req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200) resolve(req.responseText); else if (req.readyState === 4 && req.status === 404) reject(404) };
    });
};
export default postTool;