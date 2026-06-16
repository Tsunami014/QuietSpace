esbuild src/main.js --bundle --minify --outfile=bundle.js
minify test.html -o index.html
sed -i 's/src\/main.js/bundle.js/g' index.html
