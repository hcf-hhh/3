<template>
  <div>
    <el-form class="device-form">
      <el-form-item label="设备id">
        <el-input
            style="width: 200px;margin-left: 10px;float: left;" v-model="deviceId"
            placeholder="请输入设备id"></el-input>
        <el-row :gutter="24" type="flex" align="middle" style="margin-left: 15px">
          <el-col :span="15">
            <el-button type="primary" @click="search_device()" class="authority_btn">搜索
            </el-button>
            <el-button type="primary" @click="handleAdd()">新增</el-button>
            <el-button type="primary" @click="del()">
              批量删除
            </el-button>
            <el-button type="primary" @click="reset()">重置</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-table
          :data="tableData"
          style="width: 100%"
          :show-overflow-tooltip="true"
          @selection-change="handleSelectionChange"
          :header-cell-style="{'text-align':'center'}"
          :cell-style="{'text-align':'center'}">
        <el-table-column type="selection" width="50"/>
        <el-table-column
            prop="deviceId"
            label="设备Id" align="center">
        </el-table-column>
        <el-table-column
            prop="lon"
            label="经度" align="center"  width="130">
        </el-table-column>
        <el-table-column
            prop="lat"
            label="纬度" align="center"  width="130">
        </el-table-column>
        <el-table-column prop="pitch" label="俯仰角">
        </el-table-column>
        <el-table-column prop="roll" label="翻滚角">
        </el-table-column>
        <el-table-column prop="yaw" label="航向角">
        </el-table-column>
        <el-table-column
            prop="powerTest"
            label="设备电量" align="center">
        </el-table-column>
        <el-table-column
            prop="countTest"
            label="使用次数" align="center">
        </el-table-column>
        <el-table-column
            prop="warning"
            label="非法开锁警报" align="center" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.warning === '1'">不正常</span>
            <span v-else>正常</span>
          </template>
        </el-table-column>
<!--        <el-table-column-->
<!--            prop="picture"-->
<!--            label="开锁图片">-->
<!--&lt;!&ndash;          <template slot-scope="scope">&ndash;&gt;-->
<!--&lt;!&ndash;            <el-button type="text" @click="viewPicture(scope.row)">查看</el-button>&ndash;&gt;-->
<!--&lt;!&ndash;          </template>&ndash;&gt;-->
<!--          <template slot-scope="scope">-->
<!--            <img class="open_img" :src="'http://43.137.10.141:10000/device/getImage?filePath=' + '/home/aed/pic/' +scope.row.picture" alt="logo">-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column label="操作" min-width="150" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="viewItem(scope.row)">查看</el-button>
            <el-button @click="handleEdit(scope.row)" size="mini">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="sizeChange" @current-change="currentChange"
                     :current-page="page" :page-size="size" :page-sizes="pageSizes"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" style="float: left;">
      </el-pagination>
    </el-form>
    <AddOrModify v-if="dialogFormVisible" :dialogFormVisible.sync="dialogFormVisible" :deviceId="id" :type="type"
                       @refresh="load"/>
  </div>
</template>
<script>
import AddOrModify from "../../manage/device/AddOrModify";
import DeviceService from "@/api/deviceService";
import {processDataFlow} from "@/utils";
export default {
  name: 'Device',
  components: {AddOrModify},
  data() {
    return {
      id: '',
      isShowEdit: '',
      tableData: [],
      deviceId: '',
      page: 1, //第几页
      size: 10, //一页多少条
      total: 0, //总条目数
      pageSizes: [10, 20, 30, 50, 100], //可选择的一页多少条
      pageNum: 1,
      pageSize: 5,
      multipleSelection: [],
      dialogFormVisible: false,
      type: '',
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      DeviceService.searchList().then(res => {
        this.tableData = Array.from(res.data).splice(
            (this.page - 1) * this.size,
            this.size
        )
        this.total = res.data.length;
      })
    },
    handleEdit(row) {
      this.type = 'edit';
      this.id = row.id;
      this.dialogFormVisible = true
    },
    viewItem(row) {
      this.type = 'detail';
      this.id = row.id;
      this.dialogFormVisible = true
    },
    handleAdd() {
      this.type = 'add';
      this.id = undefined;
      this.dialogFormVisible = true;
    },
    viewPicture(row) {
      if (!row.picture || row.picture === '') {
        this.$message.warning("该条记录无图片");
        return;
      }
      let imageUrl = "/home/aed/pic/" + row.picture;
      DeviceService.viewPicture(imageUrl).then(
          res => {
            console.log(res);
            processDataFlow(res,imageUrl)
          }
      )
    },
    search_device() {
      DeviceService.findByDeviceId(this.deviceId).then(res => {
        this.tableData = Array.from(res.data).splice(
            (this.page - 1) * this.size,
            this.size
        )
        this.total = res.data.length;
      })
    },
    reset() {
      this.deviceId = '';
      this.load();
    },
    del() {
      let ids = this.multipleSelection.map((item) => item.id).join(",");
      let self = this;
      self
          .$confirm("此操作将删除已选择数据, 是否继续?", "温馨提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(() => {
            DeviceService.delete(ids)
                .then((res) => {
                  if (res.code === 200) {
                    self.$message.success(res.message);
                  } else {
                    self.$message.warning(res.message);
                  }
                }).finally(() => {
              self.load();
            });
          });

    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    //page改变时的回调函数，参数为当前页码
    currentChange(val) {
      console.log("翻页，当前为第几页", val);
      this.page = val;
      this.load();
    },
    //size改变时回调的函数，参数为当前的size
    sizeChange(val) {
      console.log("改变每页多少条，当前一页多少条数据", val);
      this.size = val;
      this.page = 1;
      this.load();
    },
  }
}
</script>
<style scoped>
@import "../../../assets/css/device";

</style>