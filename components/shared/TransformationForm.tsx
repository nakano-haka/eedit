"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"  
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants/indes"
import { CustomField } from "./CustomField"
import { useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { updateCredits } from "@/lib/actions/user.actions"

export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
})


const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null} : TransformationFormProps) => {

    const transformationType = transformationTypes[type]
    const [image, setimage] = useState(data)
    const [newTransformation, setnewTransformation] = useState<Transformations | null>(null)
    const [isSubmitting, setisSubmitting] = useState(false)
    const [isTransforming, setisTransforming] = useState(false)
    const [transformationConfig, settransformationConfig] = useState(config)
    const [isPending, startTransition] = useTransition()

    const initialValues = data && action === "Update" ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
    } : {
        defaultValues
    }
    
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  })
 
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  const onSelectFieldHandler = ( value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]
    setimage((prevState: any) => ({
        ...prevState,
        aspectRatio: imageSize.aspectRatio,
        width: imageSize.width,
        height: imageSize.height,
    }))

    setnewTransformation(transformationType.config)
    return onChangeField(value)
  }
  
  const onInputChangeHandler = ( fieldName: string, type: string, value: string, onChangeField: (value: string) => void) => {
    debounce(() => {
        setnewTransformation((prevState: any) => ({
           ...prevState,
            [type]: {
                ...prevState[type],
                [fieldName === "prompt" ? "prompt" : "to"] : value
            }
        }))
    }, 1000)

    return onChangeField(value)
  }

//   TODO: Add credit fee
  const onTransformHandler = async () => {
    setisTransforming(true)
    settransformationConfig(
        deepMergeObjects(
            newTransformation,
            transformationConfig
        )
    )
    setnewTransformation(null)
    startTransition(async () => {
        // await updateCredits( userId, creditFee)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomField
            control={form.control}
            name="title"
            formLabel="Image Title"
            className=" w-full"
            render={({field}) => <Input {...field} className="input-field" />}
        />
        { type === "fill" && (
            <CustomField
                control={form.control}
                name="aspectRatio"
                formLabel="Aspect Ratio"
                className=" w-full"
                render={({field}) => (
                    <Select
                        onValueChange={(value) => onSelectFieldHandler( value, field.onChange)}
                    >
                        <SelectTrigger className="select-field">
                            <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                Object.keys(aspectRatioOptions).map((key) => (
                                    <SelectItem key={key} value={key} className="select-item">
                                        { aspectRatioOptions[key as AspectRatioKey].label}
                                    </SelectItem>
                                ) )
                            }
                        </SelectContent>
                    </Select>
                )}  
            />
        )}

        {(type === "remove"||type === "recolor") && (
            <div className=" prompt-field">
                <CustomField
                    control={form.control}
                    name="prompt"
                    formLabel={
                        type === "remove" ? "Object to Remove" : "Object to recolor"
                    }
                    className=" w-full"
                    render={({field}) => (
                        <Input
                            value={field.value}
                            className="input-field"
                            onChange={(e) => onInputChangeHandler( "prompt", e.target.value, type, field.onChange)}
                        />
                        
                    )}  
                />
                {
                    type === "recolor" && (
                        <div className="color-field">
                            <CustomField
                                control={form.control}
                                name="color"
                                formLabel="Replacement Color"
                                className=" w-full"
                                render={({field}) => (
                                    <Input
                                        value={field.value}
                                        className="input-field"
                                        onChange={(e) => onInputChangeHandler( "color", e.target.value, "recolor", field.onChange)}
                                    />
                                )}  
                            />
                        </div>
                    )
                }
            </div>
        )}
        <div className=" flex flex-col gap-4">
            <Button 
                type="button" 
                className="submit-button capitalize"
                disabled={isTransforming || newTransformation === null}
                onClick={onTransformHandler}
            >
                {
                    isTransforming? "Transforming..." : "Apply Transformation"
                }
            </Button>
            <Button 
                type="submit" 
                className="submit-button capitalize"
                disabled={isSubmitting}
            >
                { 
                    isSubmitting? "Submitting..." : "Save Image"
                }
            </Button>
        </div>
      </form>
    </Form>
  )
}

export default TransformationForm