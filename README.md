## TableCustom
### 表格列自定义显示隐藏 (Table column custom display plug-in)

#### 案例展示(Case presentation)
![查看演示](https://github.com/chaorenzeng/TableCustom.js/blob/master/case_type1.gif)
![查看演示](https://github.com/chaorenzeng/TableCustom.js/blob/master/case_type2.gif)

#### 下载地址(Download address)
> https://github.com/chaorenzeng/TableCustom.js.git

#### 快速使用(Quick use)
1.引入TableCustom.css和TableCustom.js
```js
<link rel="stylesheet" type="text/css" href="js/TableCustom/TableCustom.css" />
...
<script src="js/TableCustom/TableCustom.js" type="text/javascript" charset="utf-8"></script>
```
2.指定表格Id 配置按钮Id (Specify the table Id configuration button Id)
```html
<table id="myTable">...</table>
...
<button type="button" id="myBtn">TableConfiguration</button>
```
3.创建TableCustom对象 (Create TableCustom objects)  
- 方式一:默认方式（type1: default mode）
```js
var tabelCustom = new TableCustom({
    btnId: 'myBtn', //列表配置项按钮Id
    tableId: 'myTable' //列表配置表格Id
})
```
- 方式二：分类方式（type2: classification mode）
```js
var tabelCustom = new TableCustom({
    btnId: 'myBtn', //列表配置项按钮Id
    tableId: 'myTable', //列表配置表格Id
    template: 'byCategory'
})
```

#### 支持参数(Support parameters)
可选参数 Parameter |  默认值 Default | 说明 Introduce
--        |    --   | --
btnId 			|    | 按钮ID (Button ID)
tableId 		|    | 表格ID (Table ID)
title 			|   Table Configuration  | 弹窗标题 (Popup Win title)
btnAllTxt 		|   all     | 全选按钮文字 (Select all button text)
btnReverseTxt 	|   reverse | 反选按钮文字 (Uncheck button text)
btnSaveTxt 		|   save  | 保存按钮文字 (Save button text)
tipTxt          |         | 弹窗底部说明 (Bottom description)
template 		|         | 模板 (The template)

#### 如何定制模板 (How to customize templates)
1. 在tbcustomTemplate中定义模板名和模板信息(Define the template name and template information in tbcustomTemplate)
2. 编写TableCustom.prototype.getTemplate_<模板名>定制方法 (Write TableCustom. Prototype. GetTemplate_ < template name > custom method)