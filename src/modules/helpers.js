export function randomString(length, charset) {
    let res = '';
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
  }
  
  export function generateFakeFiscalCode(decade) {
    const s = randomString(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    const d = randomString(7, "0123456789")
    return [s, decade, d[1], "A", d[2], d[3], "Y", d[4], d[5], d[6], "X"].join(
      ""
    );
  }