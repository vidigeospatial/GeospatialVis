<template>
    <b-modal
        id="linkManager-modal"
        centered
        title="Link Manager"
        ok-title="Save"
        @show="resetModal"
        @hidden="resetModal"
        @ok="saveLayout"
    >
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        >
        <p>Saved Links</p>
        <b-table
            sticky-header
            striped
            hover
            :items="items"
            :fields="fields"
        >
            <template #cell(actions)="row">
                <b-button
                    size="sm"
                    @click="removeLinks(row.item)"
                >
                    <i class="fa fa-trash" />
                </b-button>
                <b-button
                    size="sm"
                    @click="updateLinks(row.item)"
                >
                    <i class="fa fa-pencil" />
                </b-button>
            </template>
        </b-table>

        <p id="TitleOfEdition">
            Add New Link
        </p>
        <form
            ref="form"
            class="needs-validation"
            novalidate
            @submit.stop.prevent="handleSubmit"
        >
            <b-form-group
                id="linkManager-name-input-group"
                label="linkManager Name"
                label-for="linkManager-name-input"
            >
                <b-form-input
                    id="linkManager-name-input"
                    v-model="$v.form.name.$model"
                    :state="validateState('name')"
                />
            </b-form-group>
            <b-form-group>
                <label
                    class="mr-sm-2"
                    for="inline-form-custom-select-source"
                >Source:</label>
                <b-form-select
                    id="inline-form-custom-select-source"
                    v-model="source.selected"
                    @change="onChange"
                >
                    <option
                        v-for="(selectOption, indexOpt) in source.options"
                        :key="indexOpt"
                        :value="selectOption"
                    >
                        {{ selectOption }}
                    </option>
                </b-form-select>

                <label
                    class="mr-sm-2"
                    for="inline-form-custom-select-destination"
                >Destination:</label>
                <b-form-select
                    id="inline-form-custom-select-destination"
                    v-model="destination.selected"
                >
                    <option
                        v-for="(selectOption, indexOpt) in destination.options"
                        :key="indexOpt"
                        :value="selectOption"
                    >
                        {{ selectOption }}
                    </option>
                </b-form-select>

                <label
                    class="mr-sm-2"
                    for="inline-form-custom-select-type"
                >Type:</label>
                <b-form-select
                    id="inline-form-custom-select-type"
                    v-model="type.selected"
                >
                    <option
                        v-for="(selectOption, indexOpt) in type.options"
                        :key="indexOpt"
                        :value="selectOption"
                    >
                        {{ selectOption }}
                    </option>
                </b-form-select>
            </b-form-group>
        </form>
    </b-modal>
</template>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
import { bus } from "../../../../index";
import { required, minLength, between } from "vuelidate/lib/validators";

//TODO: format this form to take in the Links for the current layout and show what they are (source , target, type); A user can edit these links here or add new ones.

export default {
  name: "linkManager",
  validations: {
    form: {
      name: {
        required,
        minLength: minLength(3),
      },
    },
  },
  props: {
    ObjectList: Array,
    savedLinks: Array,
  },
  data() {
    return {
      form: {
        name: null,
      },

      source: {
        selected: "map1",
        options: ["map1", "map2", "map3"],
      },
      destination: {
        selected: "",
        options: [],
      },
      type: {
        selected: "Wind",
        options: ["Wind", "Fire", "Forest"],
      },
      items: [],
      fields: [
          { key: 'actions', label: 'Edit' },
          { key: 'name', label: 'Name'},
          { key: 'source', label: 'Source'},
          { key: 'destination', label: 'Destination'},
          { key: 'type', label: 'Type'}
          
        ],
      updating: false,
    };
  },
  created() {},
  mounted() {
    this.init();
  },
  watch: {
    ObjectList: function(newArr, oldArr) {
      this.init();
    },
    savedLinks: function(newArr, oldArr) {
      this.items = [...this.savedLinks]
      this.items.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    },
  },
  methods: {
    // Initial the selection in the form
    init() { 
      console.log(this.ObjectList);
      this.source.options = this.ObjectList;
      this.source.selected = this.source.options[0];
      this.destination.options = this.source.options.filter(
        (d) => d != this.source.selected
      );
      this.destination.selected = this.destination.options[0];
      this.type.selected = this.type.options[0]
    },
    // Real time update the selection once the source is being selected
    onChange: function() {
      console.log("Update Destination List");
      this.destination.options = this.source.options.filter(
        (d) => d != this.source.selected
      );
      this.destination.selected = this.destination.options[0];
      console.log(this.destination);
    },
    // Validate the state
    validateState(name) {
      console.log(this.$v);
      const { $dirty, $error } = this.$v.form[name];
      console.log()
      return $dirty ? !$error : null;
    },
    resetModal() {
      this.form = {
        name: null,
      };
      // this.$v.$reset();
      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
    // Saving the link as a new mapObject
    saveLayout(bvModalEvt) {
      bvModalEvt.preventDefault();
      console.log(document.getElementById("TitleOfEdition").innerHTML)
      this.$v.form.$touch();
      if(!this.updating){
        if(this.nameInUse(this.form.name)){
          var saveLink1 =
            {
              source: this.source.selected,
              destination: this.destination.selected,
              type: this.type.selected,
            };
          var saveLink2 =
            {
              source: this.destination.selected,
              destination: this.source.selected,
              type: this.type.selected,
            };
          if(this.linksExist([this.form.name, saveLink1, saveLink2])){ // Check Exist 
            console.log("This same link setting is in use.")
            alert("This same link setting is in use.")
            return;
          }
        }
      }
      if(!this.$v.form.name.required || !this.$v.form.name.minLength){
        console.log("This is a required field and must be at least 3 characters.")
        alert("This is a required field and must be at least 3 characters.")
        return;
      }
      this.handleSave();
    },
    handleSave() {
      var saveLink = 
        {
          source: this.source.selected,
          destination: this.destination.selected,
          type: this.type.selected,
        }
    
      console.log(saveLink)
      if (this.updating) {
        // Update
        bus.$emit("updateOldObj", [this.form.name, this.oldSetting, saveLink])
      }else{
        // Add new
        bus.$emit("updateLinksObj", [this.form.name, saveLink]);
      }
      
      bus.$emit("saveLayout", this.form.name);
      console.log("form name is: ", this.form.name);
      this.$emit("activeSavedLayout", this.form.name);

      this.$nextTick(() => {
        this.$bvModal.hide("linkManager-modal");
      });
      this.init()
      this.updating = false
      this.form.name = ""
    },
    updateLinks(item){
      this.updating = !this.updating
      if (!this.updating){
        document.getElementById("TitleOfEdition").innerHTML = "Add New Link"
        this.form.name = ""
        this.init()
        return;
      }
      document.getElementById("TitleOfEdition").innerHTML = "Update Link"
      this.form.name = item.name
      this.source.options = this.ObjectList;
      this.source.selected = item.source
      this.destination.options = this.source.options.filter(
        (d) => d != this.source.selected
      );
      this.destination.selected = item.destination
      this.type.selected = item.type
      this.oldSetting = {
        source: this.source.selected,
        destination: this.destination.selected,
        type: this.type.selected,
      }
    },
    nameInUse(value) {
      return this.$store.getters["layouts/isLayoutNameUsed"](value);
    },
    linksExist(arr){
      return this.$store.getters["layouts/isLinkExist"](arr);
    }
  },
};
</script>

<style lang="css" scoped></style>
