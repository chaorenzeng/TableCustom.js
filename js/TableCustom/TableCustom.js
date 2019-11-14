/*
 * TableCustom 表格列自定义显示插件
 * Author: Kevin
 * Introduce: A plug-in to hidden table column 
 * Date: 2019-11-13
 */

;
(function(window, document) {
	'use strict'

	//TableCustom 表格自定义显示插件
	function TableCustom(option) {
		this.settings = paramsExtend(this.defaults, option, true);
		this._init();
	}

	//默认可选参数
	TableCustom.prototype.defaults = {
		btnId: '', //配置项按钮
		tableId: '', //表格Id
		title: 'Table Configuration',
		btnAllTxt: 'all',
		btnReverseTxt: 'reverse',
		btnSaveTxt: 'save'
	}

	//初始化
	TableCustom.prototype._init = function() {
		// 获取按钮和表格
		var self = this,
			table = this.table = document.getElementById(this.settings.tableId),
			btnShow = this.btnShow = document.getElementById(this.settings.btnId);
		if (!table || !btnShow) {
			return
		}
		/*
			获取表格表头，建立配置项列表
			theadArray = [
				{title:"ID", show:true},
				{title:"车型", show:true}
				...
			]
		*/

		var thead = table.rows[0],
			theadArray = [],
			theadArrayStorage = this.getTbcustomStorage();
		
		if(this.check(thead, theadArrayStorage)){
			theadArray = theadArrayStorage;
		}else{
			for (var i = 0, thLength = thead.cells.length; i < thLength; i++) {
				var item = {},
					cell = thead.cells[i];
				item.dom = cell;
				item.title = cell.innerText || '';
				item.show = true;
				theadArray.push(item)
			}
			this.setTbcustomStorage(theadArray);
		}

		this.theadArray = objDeepCopy(theadArray); //实际配置项
		this.theadArrayTemp = objDeepCopy(theadArray); //临时配置项，用于显示未保存的修改

		//根据配置项列表，创建配置项显示div
		this.toast(theadArray);

		//渲染显示表格
		this.render(theadArray);

		//绑定事件：打开
		this.btnShow.addEventListener("click", function() {
			self.open();
		})
	}

	//根据配置项列表，渲染显示配置弹窗
	TableCustom.prototype.toast = function(theadArray) {
		var self = this;
		var tbcustomId = this.tbcustomId = "tbcustom" + "-" + this.settings.tableId,
			tbcustom = this.tbcustom = document.getElementById(tbcustomId);
		if (!tbcustom) {
			//不存在时创建
			tbcustom = this.tbcustom = document.createElement("div");
			tbcustom.className = "tbcustom";
			tbcustom.id = tbcustomId;

			//弹窗
			var tbcustomSaveId = tbcustomId + "-save",
				tbcustomCloseId = tbcustomId + "-close";
			var tbcustomToase =
				`
				<div class="tbcustom-toast">
					<div class="tbcustom-title">
						<span>`+ this.settings.title +`</span>
						<div class="tbcustom-title-close" id="` +
				tbcustomCloseId +
				`"></div>
					</div>
					<div class="tbcustom-main"></div>
					<div class="tbcustom-foot">
						<div class="tbcustom-all">
							<ul class="tbcustom-all-items"></ul>
						</div>
						<div class="tbcustom-submit" id="` +
				tbcustomSaveId + `">`+ this.settings.btnSaveTxt +`</div>
					</div>
				</div>
			`
			tbcustom.innerHTML = tbcustomToase;
			document.body.appendChild(tbcustom);
			//绑定事件：保存
			document.getElementById(tbcustomSaveId).addEventListener("click", function() {
				self.save();
			})
			//绑定事件：关闭
			document.getElementById(tbcustomCloseId).addEventListener("click", function() {
				self.close();
			})

			//选项
			var tbcustomList = this.tbcustomList = document.createElement("ul");
			tbcustomList.className = "tbcustom-main-list";
			for (var j = 0, cusLen = theadArray.length; j < cusLen; j++) {
				var item = theadArray[j],
					li = document.createElement("li"),
					input = document.createElement("input"),
					label = document.createElement("label");
				input.type = "checkbox";
				input.checked = item.show;
				input.id = this.tbcustomId + "-checkbox" + j;
				input.setAttribute("data-tbcusindex", j);
				label.innerText = item.title;
				label.className = "tbcustom-main-checkbox-label"
				label.setAttribute("for", input.id);
				li.appendChild(input);
				li.appendChild(label);
				tbcustomList.appendChild(li);
				input.onchange = function(ele) {
					self.change(ele);
				}
			}
			tbcustom.querySelector(".tbcustom-main").appendChild(tbcustomList)

			//全选和反选
			var tbcustomAllId = this.tbcustomId + "-all",
				tbcustomReverseId = this.tbcustomId + "-reverse";
			var tbcustomAll = `
				<li>
					<input type="checkbox" name="" id="` + tbcustomAllId + `"/>
					<label for="` +
				tbcustomAllId + `">`+ this.settings.btnAllTxt +`</label>
				</li>
				<li>
					<input type="checkbox" name="" id="` + tbcustomReverseId +
				`"/>
					<label for="` + tbcustomReverseId +
				`">`+ this.settings.btnReverseTxt +`</label>
				</li>
				<div class="tbcustom-clearfloat"></div>
			`;
			tbcustom.querySelector(".tbcustom-all-items").innerHTML = tbcustomAll;
			var tbcustomAll = this.tbcustomAll = document.getElementById(tbcustomAllId),
				tbcustomReverse = this.tbcustomReverse = document.getElementById(tbcustomReverseId);
			tbcustomAll.addEventListener("change", function() {
				tbcustomReverse.checked = false;
				self.all(this.checked)
			})
			tbcustomReverse.addEventListener("change", function() {
				tbcustomAll.checked = false;
				self.reverse(this.checked)
			})

		} else {
			//已存在时修改
			this.tbcustomList.querySelectorAll("li").forEach(function(item, i) {
				item.children[0].checked = theadArray[i].show ? true : false;
				item.children[1].innerText = theadArray[i].title;
			})
		}
	}

	//根据配置项列表，渲染显示表格
	TableCustom.prototype.render = function(theadArray) {
		for (var i = 0, tbodyLen = this.table.rows.length; i < tbodyLen; i++) {
			var row = this.table.rows[i];
			for (var j = 0, trLen = row.cells.length; j < trLen; j++) {
				var td = row.cells[j];
				if (theadArray[j].show) {
					td.style.display = "";
				} else {
					td.style.display = "none";
				}
			}
		}
	}

	//全选
	TableCustom.prototype.all = function(type) {
		for (var i = 0, tempCusLen = this.theadArrayTemp.length; i < tempCusLen; i++) {
			var item = this.theadArrayTemp[i];
			item.show = type;
		}
		this.toast(this.theadArrayTemp);
	}

	//反选
	TableCustom.prototype.reverse = function(type) {
		for (var i = 0, tempCusLen = this.theadArrayTemp.length; i < tempCusLen; i++) {
			var item = this.theadArrayTemp[i];
			item.show = !item.show;
		}
		this.toast(this.theadArrayTemp)
	}

	//改变
	TableCustom.prototype.change = function(ele) {
		//1.修改theadArrayTemp
		var item = ele.target,
			ischecked = item.checked ? true : false,
			index = item.getAttribute("data-tbcusindex");
		this.theadArrayTemp[index]["show"] = ischecked;
		//2.取消反选
		this.tbcustomReverse.checked = false;
		//3.判断全选
		var noAllSelected = this.theadArrayTemp.some(function(obj) {
			//是否存在未选择选项
			return !obj.show
		})
		if (noAllSelected) {
			this.tbcustomAll.checked = false;
		} else {
			this.tbcustomAll.checked = true;
		}
	}

	//保存
	TableCustom.prototype.save = function() {
		var theadArray = this.theadArrayTemp;
		this.theadArray = theadArray.slice(0);
		this.setTbcustomStorage(theadArray);
		this.render(theadArray);
		this.close();
	}

	//打开
	TableCustom.prototype.open = function() {
		if (this.tbcustom) {
			this.tbcustom.style.display = "block";
		}
	}

	//关闭
	TableCustom.prototype.close = function(type) {
		if (this.tbcustom) {
			//取消全选反选
			this.tbcustomAll.checked = false;
			this.tbcustomReverse.checked = false;
			//更新theadArrayTemp
			this.theadArrayTemp = objDeepCopy(this.theadArray);
			this.toast(this.theadArray);
			//隐藏弹窗
			this.tbcustom.style.display = "none";
		}
	}

	//获取缓存
	TableCustom.prototype.getTbcustomStorage = function() {
		var storageName = "tbcustom_" + this.settings.tableId;
		return JSON.parse(localStorage.getItem(storageName) || "[]");
	}

	//设置缓存
	TableCustom.prototype.setTbcustomStorage = function(theadArray) {
		var storageName = "tbcustom_" + this.settings.tableId;
		localStorage.setItem(storageName, JSON.stringify(theadArray || []));
	}
	
	//检查缓存是否与表格一致
	TableCustom.prototype.check = function(thead, theadArrayStorage) {
		try{
			if(!theadArrayStorage){
				return false;
			}
			if(!Array.isArray(theadArrayStorage)){
				return false;
			}
			if(theadArrayStorage.length != thead.cells.length){
				return false;
			}
			var isDifferent = theadArrayStorage.some(function(item, index){
				return item.title != thead.cells[index].innerText;
			})
			if(isDifferent){
				return false;
			}
			return true;
		}catch(e){
			return false;
		}
	}

	//参数默认值覆盖
	function paramsExtend(o, n, override) {
		for (var key in n) {
			if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
				o[key] = n[key];
			}
		}
		return o;
	}

	//对象数组深拷贝
	function objDeepCopy(obj) {
		var result = Array.isArray(obj) ? [] : {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object') {
					result[key] = objDeepCopy(obj[key]); // 递归复制
				} else {
					result[key] = obj[key];
				}
			}
		}
		return result;
	}

	window.TableCustom = TableCustom;
})(window, document);
