<template>
  <div>
    <el-form class="manager-form">
      <el-form-item label="管理人员姓名">
        <el-input
            style="width: 200px;margin-left: 10px;float: left;" v-model="managerName"
            placeholder="请输入管理人员姓名"></el-input>
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
            label="设备ID">
        </el-table-column>
        <el-table-column
            prop="identityGet"
            label="开锁方式">
          <template slot-scope="scope">
            <template v-if="scope.row.identityGet === 'Weixin'">
              小程序开锁
            </template>
            <template v-else>
              {{ scope.row.identityGet }}
            </template>
          </template>
        </el-table-column>
        <el-table-column
            prop="managerName"
            label="姓名">
        </el-table-column>
        <el-table-column
            prop="picture"
            label="开锁图片">
          <template slot-scope="scope">
            <img class="open_img" :src="'http://43.137.10.141:8088/image/' +scope.row.picture" alt="logo" @click="upload(scope.row.picture)">
          </template>
        </el-table-column>
        <el-table-column
            prop="usetime"
            label="开锁时间">
        </el-table-column>
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
    <AddOrModify v-if="dialogFormVisible" :dialogFormVisible.sync="dialogFormVisible" :manager-id="id" :type="type"
                 @refresh="load"/>
  </div>
</template>
<script>
import request from "@/utils/request";
import AddOrModify from "@/views/manage/manager/AddOrModify";
import UserService from "@/api/userService";
import DeviceService from "@/api/deviceService";
export default {
  name: 'UserOpen',
  components: {AddOrModify},
  data() {
    return {
      tableData: [],
      managerName: "",
      page: 1, //第几页
      size: 10, //一页多少条
      total: 0, //总条目数
      pageSizes: [10, 20, 30, 50, 100], //可选择的一页多少条
      pageNum: 1,
      pageSize: 5,
      dialogFormVisible: false,
      type: '',
      id: '',
      multipleSelection: []
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      DeviceService.searchList().then(res => {
        this.tableData = Array.from(res.data).filter(item => item.identityGet && item.identityGet.length > 0 && item.identityGet !== "Admin").splice(
            (this.page - 1) * this.size,
            this.size
        );
        this.total = this.tableData.length;
      })
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
            UserService.delete(ids)
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
    reset() {
      this.managerName = '';
      this.load();
    },
    upload(pic) {
      window.open(this.baseUrl + pic, '_blank')
    },
    search_device() {
      UserService.findByName(this.managerName).then(res => {
        this.tableData = Array.from(res.data).splice(
            (this.page - 1) * this.size,
            this.size
        )
        this.total = res.data.length;
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
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
@import "../../../assets/css/manager";
</style>