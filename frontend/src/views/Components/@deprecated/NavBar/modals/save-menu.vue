<template>
    <b-modal
        id="saveAs-modal"
        centered
        title="Save As" 
        ok-title="Save"
        @show="resetModal"
        @hidden="resetModal"
        @ok="saveLayout"
    >
        <form
            ref="form"
            @submit.stop.prevent="handleSubmit"
        >
            <b-form-group
                id="layout-name-input-group"
                label="Layout Name"
                label-for="layout-name-input"
            >
                <b-form-input
                    id="layout-name-input"
                    v-model="$v.form.name.$model"
                    :state="validateState('name')"
                    aria-describedby="layout-name-input-live-feedback"
                />
                <b-form-invalid-feedback id="layout-name-input-live-feedback">
                    <p v-if="!$v.form.name.required || !$v.form.name.minLength">              
                        This is a required field and must be at least 3 characters.
                    </p>
                    <p v-if="!$v.form.name.nameInUse">              
                        This layout name is in use.
                    </p>
                </b-form-invalid-feedback>
            </b-form-group>
        </form>
    </b-modal>
</template>

<script>
import { required, minLength, between } from 'vuelidate/lib/validators'
import { bus } from '../../../../index'

function nameInUse(value){
    return true //! this.$store.getters['layouts/isLayoutNameUsed'](value)
}

export default {
    name: "SaveMenu",
    validations:{
        form: {
            name: {
                required,
                nameInUse,
                minLength: minLength(3)
            }
        }
    },
    data(){
        return {
            form:{
                name: null
            },
        }
    },
    created(){

    },
    methods: {
        validateState(name) {
            console.log(this.$v)
            const { $dirty, $error } = this.$v.form[name]
            return $dirty ? !$error : null
        },
        resetModal() {
            this.form = {
                name: null
            }
            // this.$v.$reset();
            this.$nextTick(() => {
                this.$v.$reset()
            })
        },
        saveLayout(bvModalEvt){
            bvModalEvt.preventDefault()
            this.handleSave()
        },
        handleSave(){
            this.$v.form.$touch()
            if (this.$v.form.$anyError) {
                return
            }

            bus.$emit("saveLayout", this.form.name)
            this.$emit("activeSavedLayout", this.form.name)
            // this.$bvModal.hide('saveAs-modal')
            this.$nextTick(() => {
                this.$bvModal.hide('saveAs-modal')
            })
        }
    }
}
</script>

<style lang="css" scoped>

</style>