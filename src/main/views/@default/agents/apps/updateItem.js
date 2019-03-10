Tea.context(function () {
	// 数据源Javascript
	if (this.formJavascript.length > 0) {
		eval(this.formJavascript);
	}

	this.$delay(function () {
		this.$find("form input[name='name']").focus();
	});

	/**
	 * 提交成功
	 */
	this.submitSuccess = function () {
		alert("保存成功");
		window.location = this.from;
	};

	/**
	 * 数据源分类
	 */
	this.selectedCategory = "basic";

	this.selectCategory = function (category) {
		this.selectedCategory = category;
		this.changeSource();
	};

	/**
	 * 数据源
	 */
	this.isLoaded = false;
	this.sourceCode = this.item.sourceCode;
	this.sourceDescription = "";
	this.item.interval = this.item.interval.replace(/s$/, "");
	var that = this;
	this.selectedCategory = this.sources.$find(function (k, v) {
		return v.code == that.sourceCode;
	}).category;
	this.defaultThresholds = [];

	this.changeSource = function () {
		var that = this;
		var source = this.sources.$find(function (k, v) {
			return v.code == that.sourceCode;
		});
		this.sourceDescription = source.description;
		if (source.thresholds != null) {
			this.defaultThresholds = source.thresholds;
		}

		if (!this.isLoaded) {
			this.isLoaded = true;
			return;
		}

		this.$delay(function () {
			this.$find("input[name^='" + this.sourceCode + "_']:not([type='hidden'])").first().focus();
		});
	};

	this.$delay(function () {
		this.changeSource();
	});

	/**
	 * 更多选项
	 */
	this.advancedOptionsVisible = false;
	this.showAdvancedOptions = function () {
		this.advancedOptionsVisible = !this.advancedOptionsVisible;
	};

	/**
	 * 数据格式
	 */
	this.dataFormatDescription = "";
	this.$delay(function () {
		this.changeDataFormat();
	});

	this.changeDataFormat = function () {
		var that = this;
		this.dataFormatDescription = this.dataFormats.$find(function (k, v) {
			return v.code == that.item.sourceOptions.dataFormat;
		}).description;
	};

	/**
	 * 阈值
	 */
	this.conds = [];
	this.addingCond = null;
	this.condIndex = 0;

	if (this.item.thresholds.length > 0) {
		var that = this;
		this.conds = this.item.thresholds.$map(function (k, v) {
			return {
				"id": that.condIndex++,
				"param": v.param,
				"op": v.operator,
				"value": v.value,
				"description": "",
				"noticeLevel": v.noticeLevel,
				"noticeLevelName": that.noticeLevels.$find(function (k1, v1) {
					return v1.code == v.noticeLevel
				}).name,
				"noticeMessage": v.noticeMessage,
				"actions": (v.actions == null) ? [] : v.actions,
				"isAdding": false
			};
		});
	}

	this.addCond = function () {
		this.addingCond = {
			"id": this.condIndex++,
			"param": "${0}",
			"op": "eq",
			"value": "",
			"description": "",
			"noticeLevel": 2,
			"noticeLevelName": "",
			"noticeMessage": "",
			"isAdding": true,
			"actions": []
		};
		this.changeCondOp(this.addingCond);
		this.$delay(function () {
			this.$find("form input[name='addingParam']").focus();
			window.scroll(0, 10000);
		});
	};

	this.changeCondOp = function (cond) {
		cond.description = this.operators.$find(function (k, v) {
			return cond.op == v.op;
		}).description;
	};

	this.removeCond = function (index) {
		if (!window.confirm("确定要删除该阈值设置吗？")) {
			return;
		}
		this.conds.$remove(index);
		this.addingCond = null;
	};

	this.confirmAddingCond = function () {
		if (this.addingCond.param.length == 0) {
			alert("请输入参数");
			this.$find("form input[name='addingParam']").focus();
			return;
		}
		var that = this;
		this.addingCond.noticeLevelName = this.noticeLevels.$find(function (k, v) {
			return v.code == that.addingCond.noticeLevel;
		}).name;
		this.addingCond.isAdding = false;
		this.conds.push(this.addingCond);
		this.addingCond = null;
	};

	this.cancelAddingCond = function () {
		this.addingCond = null;
	};

	this.editCond = function (cond) {
		this.addingCond = {
			"id": cond.id,
			"param": cond.param,
			"op": cond.op,
			"value": cond.value,
			"description": cond.description,
			"noticeLevel": cond.noticeLevel,
			"noticeLevelName": cond.noticeLevelName,
			"noticeMessage": cond.noticeMessage,
			"actions": cond.actions,
			"isAdding": false
		};
	};

	this.saveCond = function () {
		var index = -1;
		var that = this;
		this.addingCond.noticeLevelName = this.noticeLevels.$find(function (k, v) {
			return v.code == that.addingCond.noticeLevel;
		}).name;

		this.conds.$each(function (k, v) {
			if (v.id == that.addingCond.id) {
				v.param = that.addingCond.param;
				v.op = that.addingCond.op;
				v.value = that.addingCond.value;
				v.description = that.addingCond.description;
				v.noticeLevel = that.addingCond.noticeLevel;
				v.noticeLevelName = that.addingCond.noticeLevelName;
				v.noticeMessage = that.addingCond.noticeMessage;
				v.actions = that.addingCond.actions;
			}
		});
		this.addingCond = null;
	};

	this.addCondAction = function () {
		this.addingCond.actions.push({
			"code": "script",
			"options": {
				"scriptType": "path"
			}
		});
	};

	this.removeCondAction = function (index) {
		this.addingCond.actions.$remove(index);
	};

	/**
	 * 默认阈值
	 */
	this.addThreshold = function (threshold) {
		this.conds.push({
			"id": this.condIndex++,
			"param": threshold.param,
			"op": threshold.operator,
			"value": threshold.value,
			"description": "",
			"noticeLevel": threshold.noticeLevel,
			"noticeLevelName": this.noticeLevels.$find(function (k1, v1) {
				return v1.code == threshold.noticeLevel
			}).name,
			"noticeMessage": threshold.noticeMessage,
			"actions": (threshold.actions == null) ? [] : threshold.actions,
			"isAdding": false
		});
	};

	this.addDefaultThresholds = function () {
		var that = this;
		this.defaultThresholds.$each(function (k, v) {
			that.addThreshold(v);
		});
	};
});