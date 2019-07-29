import { Observable } from "rxjs";

export function loadJSONP(settings) {
  const url = settings.url;
  const callbackName = settings.callbackName;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;

  window[callbackName] = data => {
    window[callbackName].data = data;
  };

  return Observable.create(observer => {
    const handler = e => {
      const status = e.type === "error" ? 400 : 200;
      const response = window[callbackName].data;
      if (status === 200) {
        observer.next({
          status,
          responseType: "jsonp",
          response,
          originalEvent: e
        });

        observer.complete();
      } else {
        observer.error({
          type: "error",
          status,
          originalEvent: e
        });
      }
    };

    script.onload = script.onreadystatechanged = script.onerror = handler;
    const head = window.document.getElementsByTagName("head")[0];
    head.insertBefore(script, head.firstChild);
  });
}

export function makeRow(props) {
  const row = document.createElement("tr");
  row.id = props.net + props.code;
  const time = new Date(props.time);
  [
    props.place,
    props.mag,
    `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`
  ].forEach(text => {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  });
  return row;
}

export function makeTweetElement(tweetObj) {
  const tweetEl = document.createElement("div");
  tweetEl.className = 'tweet';
  const time = new Date(tweetObj.created_at);
  const timeText = `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`;
  tweetEl.innerHTML = `
    <img src="${tweetObj.user.profile_image_url}" class="avatar"/>
    <div class="content">${tweetObj.text}</div>
    <div class="time">${timeText}</div>
  `;
  return tweetEl;
}

export function identity(x) {
  return x;
}

export function isDev() {
    return process.env.NODE_ENV === 'development';
}
