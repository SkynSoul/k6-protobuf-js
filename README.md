<div align="center">

# k6-protobuf-js
A demo with tcp and protobuf for K6

</div>

## 相关知识点

- [Node.js](https://nodejs.dev/learn)
- [K6](https://k6.io/docs/)
- [webpack](https://webpack.js.org/concepts/)

## 工作原理

K6其实与Node.js有很大不同，它并不支持Node.js原生的库及第三方库的引用。其JavaScript引擎为 [goja](https://github.com/dop251/goja) ，一些ES6+的语法在这个引擎中也并不会原生的支持。<br>
在本项目中，我们使用webpack对k6相关模块进行打包，将所有运行代码和相关依赖最终汇总为一个bundle文件，使其能够在K6中正常运行。<br>
同时，本项目中的K6依赖于 [xk6-tcp](https://github.com/SkynSoul/xk6-tcp) 提供的TCP支持，原生K6并不适用。<br>

## 目录结构

#### 结构一览
|--k6-protobuf-js<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--dist<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--node_modules<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--src<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|--k6-entry<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|--node<br>
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|--proto<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--babel.config.json<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--package.json<br>
|&nbsp;&nbsp;&nbsp;&nbsp;|--webpack.config.js<br>

#### 相关说明
<table >
    <tr>
        <td>dist</td>
        <td>最终bundle生成目录</td>
    </tr>
    <tr>
        <td>node_modules</td>
        <td>相关依赖</td>
    </tr>
    <tr>
        <td>k6-entry</td>
        <td>K6示例</td>
    </tr>
    <tr>
        <td>node</td>
        <td>Node.js示例</td>
    </tr>
    <tr>
        <td>proto</td>
        <td>Protobuf协议</td>
    </tr>
    <tr>
        <td>babel.config.json</td>
        <td>babel配置文件</td>
    </tr>
    <tr>
        <td>package.json</td>
        <td>项目配置文件</td>
    </tr>
    <tr>
        <td>webpack.config.js</td>
        <td>webpack配置文件</td>
    </tr>
</table>

## 使用步骤

1. 安装依赖
  ```bash
  npm install
  ```
2. 生成bundle文件
  ```bash
  npm run build
  ```
3. 运行server
  ```bash
  node ./src/node/server.js
  ```
4. 使用K6运行压测脚本
  ```bash
  k6 run ./dist/demo.bundle.js -u 1 -d 20s
  ```

## 附加

#### proto协议js文件生成
1. 安装 [protoc](https://github.com/protocolbuffers/protobuf/releases)
2. 生成js文件
  ```bash
  protoc --js_out=import_style=commonjs,binary:. ./src/proto/simple-time.proto
  ```
默认会在proto同级目录下生成[name]_pb.js文件

