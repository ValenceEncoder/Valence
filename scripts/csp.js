/**
 * Script to generate sha checksums for inclusion in Content Security Poly Headers
 */
const fs = require("fs");
const Base64 = require("crypto-js/enc-base64");
const sha256 = require("crypto-js/sha256");

// Add Path to CSS files here to have them hashed.
const cssFiles = []

class CSP {
    
    constructor() {
        this.scriptSrc = [
            `'self'`,
            `'sha256-MKQyGgR6cDXjHFnURvyQfiS5yIK6VphXbnHZUMGAafo='`
        ];
        this.styleSrc = [
            `'self'`, 
            `https://fonts.googleapis.com`,
            `'sha256-ct0VctZeN2NHCY4B6U7le9yxQbLipadwEZd3NWfJrcY='`,
        ];
        this.fontSrc = [
            `'self'`,
            `https://themes.googleusercontent.com`,
            `https://fonts.gstatic.com`
        ]

    }

    hashStylesheets(files) {
        const hashes = CSP.hashFiles(files);
        this.styleSrc = this.styleSrc.concat(hashes);
    }

    hashScripts(files) {
        const hashes = CSP.hashFiles(files);
        this.scriptSrc = this.scriptSrc.concat(hashes);
    }

    hashFonts(files) {
        const hashes = CSP.hashFiles(files);
        this.fontSrc = this.fontSrc.concat(hashes);
    }

    static hashFiles(files) {
        const hashes = [];
        for (const file of files) {
            console.log(`Generating SHA checksum for ${file}`);
            hashes.push(CSP.hashFile(file));
        }
        return hashes;
    }

    static hashFile(file) {
        return CSP.hash(fs.readFileSync(file, {encoding: "utf-8"}) + "\n    ");
    }

    static hash(content) {
        return `'sha256-${Base64.stringify(sha256(content))}'`;
    }

    get script() {
        return `script-src ${this.scriptSrc.join(" ")};`
    }
    
    get font() {
        return `font-src ${this.fontSrc.join(" ")};`
    }

    get style() {
        return `style-src ${this.styleSrc.join(" ")};`
    }

    get ContentSecurityPolicy() {
        return [this.script, this.style, this.font].join(" ");
    }

     
}

const instance = new CSP();
instance.hashStylesheets(cssFiles);

module.exports = instance;
